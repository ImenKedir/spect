import { z } from "zod";

import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { LLMChain} from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { resolveHTTPResponse } from "@trpc/server/http";

export const chatRouter = createTRPCRouter({
  askQuestion: publicProcedure
    .input(
      z.object({
        messageId: z.string(),
        userMessage: z.string(),
        memory: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      dotenv.config();
      const model = new OpenAI({ temperature: 0 });
      const client = new PineconeClient();
      await client.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
      const pineconeIndex = client.Index(process.env.PINECONE_INDEX!);

      const askTemplate = `Act as an AI assistant to a human asking a question related to construction. If you do not know the answer, truthfully say you do not know. You will have access to the chat history and some documents that may help you answer the question. You can also ask the human for more information.\n\nChat History:\n{memory}\nDocuments:\n{documents}\nHuman: {question}\nAI Assistant:`;

      const askPrompt = new PromptTemplate({
        template: askTemplate,
        inputVariables: ["question", "memory", "documents"],
      });

      const askChain = new LLMChain({
        llm: model,
        prompt: askPrompt,
      });

      const showSourcesTemplate = `Act as an AI that determines if the following documents contain information that is useful based on the question trying to be answered. Simply respond with "true" or "false". Do not respond in any other way. 

      Documents:
      "GMP Amendment” means an amendment to this Agreement that establishes the GMP or changes the GMP. Each approved GMP proposal is made part of this Agreement by a GMP Amendment.
      The Contract Price is subject to adjustments under Article 6 and by GMP Amendment.
      
      Question: What is a GMP Contract?
      AI Assistant: true
      
      Documents:
      Date Answered
      Answer
      
      Human: What day is it?
      AI Assistant: false
      
      Documents:
      CONTRACTOR shall establish principal axis lines of the building and site whereupon the SUBCONTRACTOR shall lay out and be strictly responsible for the accuracy of the SUBCONTRACTOR'S Work and for any loss or damage to CONTRACTOR or others by reason of SUBCONTRACTOR'S failure to set out or perform its work correctly.
      Differing Site Conditions
      
      Human: Who is responsible for site inspections?
      AI Assistant: true
      
      Documents:
      {documents}
      Human: {question}
      AI Assistant:`;

      const showSourcesPrompt = new PromptTemplate({
        template: showSourcesTemplate,
        inputVariables: ["question", "documents"],
      });

      const showSourcesChain = new LLMChain({
        llm: model,
        prompt: showSourcesPrompt,
      });

      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings(),
        { pineconeIndex }
      );

      const vsRes = await vectorStore.similaritySearchWithScore(input.userMessage, 5);

      const simScores = vsRes.map((doc) => doc[1]);
      const docs = vsRes.map((doc) => doc[0]);

      const formatedDocs = docs.reduce(
        (docs, doc) => docs + doc.pageContent + "\n",
        ""
      );

      const askResponse = await askChain.call({
        question: input.userMessage,
        memory: input.memory,
        documents: formatedDocs,
      });

      const showSourcesResponse = await showSourcesChain.call({
        question: input.userMessage,
        documents: formatedDocs,
      });

      const rawPrompt = await askPrompt.format({
        question: input.userMessage,
        documents: formatedDocs,
        memory: input.memory,
      });

      const newMemory = `Documents: ${formatedDocs}\nHuman: ${
        input.userMessage
      }\nAI Assistant: ${askResponse.text as string}`;

      return {
        messageId: input.messageId,
        userMessage: input.userMessage,
        spectMessage: askResponse.text as string,
        spectSources: docs,
        showSources: showSourcesResponse.text == " true" ? true : false,
        newMemory: newMemory,
        rawPrompt: rawPrompt,
        socres: simScores,
      };
    }),
});
