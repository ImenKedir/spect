# chatbot for multiple ocumemts

import time
import os
from langchain.chains.question_answering import load_qa_chain
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
import pinecone
from langchain import OpenAI, ConversationChain, LLMChain, PromptTemplate
from langchain.memory import ChatMessageHistory, ConversationBufferMemory
from langchain.chains import ConversationChain, ChatVectorDBChain, SimpleSequentialChain
from langchain.prompts.prompt import PromptTemplate


os.environ['OPENAI_API_KEY'] = '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'
PINECONE_API_KEY = '19b3233e-861f-4189-8ea3-47458a3436e4'
PINECONE_API_ENV = 'us-west4-gcp'

# setup chain to take question determine if the question is about chat history, project scope, or general
def get_context_chain(): #TODO: use this for few shot prompting AND USE SIMILARITY EXAMPLE SELECTOR : https://python.langchain.com/en/latest/modules/prompts/prompt_templates/examples/few_shot_examples.html
    openai = OpenAI(temperature=0.1)
    contextTemplate = """Act as a classifier for questions from human construction workers. Given the question and chat history, determine what the human is asking about.
                    If the human is asking to clarrify or elaborate on previous questions they asked, then classify the question as "chat".
                    If the human is asking about information that could be found on construction documents including specifications, contracts, permits and approvals, or drawings, then classify the question as "docs".
                    If the human is asking a general question that does not relate to the chat history or the construction documents, then classify the question as "general".
                    If the AI does not know how to classify the question then truthfully say I dont know. Examples are provided below:
                    ###
                    Chat History: []
                    Human: How long does concrete usually take to dry?
                    AI Assitant: general
                    ###
                    Chat History: [HumanMessage(content='What is the typical drying time for concrete?', additional_kwargs=), AIMessage(content=" I'm sorry, I do not know the answer to that question.", additional_kwargs=)]
                    Human: What was my previous question?
                    AI Assitant: chat
                    ###
                    Chat History: []
                    Human: What type of concrete should we use for this project?
                    AI Assitant: docs
                    ###
                    Chat History:
                    {history}
                    Human: {question}
                    AI Assistant:____"""
    contextPrompt = PromptTemplate(
        input_variables=["history", "question"], 
        template=contextTemplate
    )
    contextChain = LLMChain(llm=openai,                  
                        verbose=False,
                        prompt=contextPrompt)
    return contextChain

# setup chain to take question answer them with normal llm 
def get_general_chain():
    openai = OpenAI(temperature=0.1)
    generalTemplate = """Act as an AI assistant to a human asking a question related to construction. If you do not know the answer, truthfully say you do not know.
                    
                    Human: {question}
                    AI Assistant:"""
    generalPrompt = PromptTemplate(
        input_variables=["question"], 
        template=generalTemplate
    )
    generalChain = LLMChain(llm=openai,                  
                        verbose=False,
                        prompt=generalPrompt)
    return generalChain

# setup chain to take question and chat history and generate standalone quesiton
def get_chat_chain():
    openaichat = ChatOpenAI(temperature= 0.1, model_name="gpt-3.5-turbo")
    chatTemplate = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
    
                Chat History:
                {history}
                Follow Up Input: {input}
                Standalone question:"""
    chatPrompt = PromptTemplate(
        input_variables=["history", "input"], 
        template=chatTemplate
        )
    chatChain = LLMChain( # right now im not using ConversationChain so I cant user memory, so right now im just storying all history which will need to change. If using ConversationChain I use memory=ConversationBufferMemory(ai_prefix="AI Assistant", human_prefix="Human")
        prompt=chatPrompt,
        llm=openaichat, 
        verbose=False
    )
    return chatChain

# setup chain to take question and relevant documents and generate an answer
def get_qa_chain():
    openai = OpenAI(temperature=0.1)
    qaTemplate = """Given the following documents and question, respond with an accurate answer to the question. 
                If the AI does not know the answer to a question, it truthfully says it does not know. 

                Documents: 
                {input_documents}
                Human: {question}
                AI Assistant:"""
    qaPrompt = PromptTemplate(
        input_variables=["input_documents", "question"], 
        template=qaTemplate
    )
    qaChain = LLMChain(llm=openai,                  
                        verbose=False,
                        prompt=qaPrompt)
    return qaChain

def start_conversation():
    pinecone.init(
            api_key=PINECONE_API_KEY, # app.pinecone.io
            environment=PINECONE_API_ENV 
        )
    index = pinecone.Index('user1')
    index_stats = index.describe_index_stats()
    namespace = 'combined_pdfs'
    docsearch = Pinecone.from_existing_index('user1', OpenAIEmbeddings(), namespace=namespace) # cant remove namespace=namespace here so will probably have to combine pdfs into one namespace

    contextChain = get_context_chain()
    generalChain = get_general_chain()
    chatChain = get_chat_chain()
    qaChain = get_qa_chain()
    
    history = ChatMessageHistory()
    while True:
        query = input("Chat: ")

        ##### TESTING CONTEXT CHAIN
        context = contextChain({"history": history.messages, "question": query})
        # print("CONTEXT: ", context['text'])
        #####

         ##### TESTING GENERAL CHAIN
        general = generalChain({"question": query})
        # print("GENERAL: ", general['text'])
        #####

        docs = docsearch.similarity_search(query, include_metadata=True) # choosing to remove "namespace=namespace" parameter here to search across all namespaces
        
        # get standalone question
        standaloneQuestion = chatChain.predict(history=history.messages, input=query )
        print("STANDALONE QUESTION", standaloneQuestion)
        # add user question to history
        history.add_user_message(standaloneQuestion)
        answer = qaChain({"input_documents": [docs[0].page_content], "question": standaloneQuestion}) # only using first doc for answer rn, might need to change later to [doc.page_content for doc in docs]
        # add ai answer to history
        history.add_ai_message(answer["text"])
        print(answer["text"])

if __name__ == "__main__":
    start = time.time()
    start_conversation()
    end = time.time()
    # print(end-start, " seconds")

