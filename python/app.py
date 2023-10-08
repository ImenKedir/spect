# creates flask backend

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from langchainTest import extract_pdf_text, divide_pdf_text, create_embeddings, ask_question

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

def start_conversation(query, document_name):
    pdfpath = "/Users/sheelsansare/Desktop/spect-ai/src/Python/data/" + document_name
    data = extract_pdf_text(pdfpath)
    pdfname = pdfpath.split('/')[-1].split('.')[-2]

    texts = divide_pdf_text(data)
    docsearch, namespace = create_embeddings(texts, pdfname)
    answer, pages, sources = ask_question(docsearch, query, namespace)

    combinedsources = []
    for i in range(len(pages)):
        # print("Page", pages[i], " in", sources[i])
        combinedsources.append("Page " + str(pages[i] + 1)+ " in " + str(sources[i]))
    # print(combinedsources)
    result = {"question": query, "answer": answer, "sources": combinedsources}
    # print(result)
    return result

@app.route('/process_input', methods=['POST'])
def process_input():
    user_input = request.json['user_input']
    document_name = request.json['document_name']
    # print(user_input)
    print("document name", type(document_name))
    print("document name", document_name)
    result = start_conversation(user_input, document_name)
    return jsonify({'result': result})
   

if __name__ == '__main__':
    app.run(debug=True)