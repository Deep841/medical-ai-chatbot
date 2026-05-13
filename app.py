import os
import logging
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from src.helper import download_hugging_face_embeddings
from src.prompt import system_prompt

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# ── Validate required env vars at startup ──────────────────────────────────
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
GITHUB_TOKEN     = os.environ.get("GITHUB_NEW_API_TOKEN")

if not PINECONE_API_KEY:
    raise RuntimeError("PINECONE_API_KEY is not set. Check your .env file.")
if not GITHUB_TOKEN:
    raise RuntimeError("GITHUB_NEW_API_TOKEN is not set. Check your .env file.")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY

# ── App ────────────────────────────────────────────────────────────────────
app = Flask(__name__, template_folder="template")
app.config["JSON_SORT_KEYS"] = False
CORS(app, resources={"/get": {"origins": "http://localhost:3000"}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "30 per hour"],
    storage_uri="memory://"
)

# ── RAG pipeline (initialised once at startup) ─────────────────────────────
logger.info("Loading embeddings...")
embeddings = download_hugging_face_embeddings()

logger.info("Connecting to Pinecone index...")
docsearch = PineconeVectorStore.from_existing_index(
    index_name="medicalbot",
    embedding=embeddings
)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.4,
    max_tokens=500,
    openai_api_key=GITHUB_TOKEN,
    openai_api_base="https://models.inference.ai.azure.com"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

rag_chain = create_retrieval_chain(
    retriever,
    create_stuff_documents_chain(llm, prompt)
)
logger.info("RAG pipeline ready.")

# ── Routes ─────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("chat.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "gpt-4o-mini", "index": "medicalbot"})


@app.route("/get", methods=["POST"])
@app.route("/api/get", methods=["POST"])
@limiter.limit("20 per minute")
def chat():
    msg = request.form.get("msg", "").strip()

    if not msg:
        return jsonify({"error": "Message cannot be empty."}), 400
    if len(msg) > 500:
        return jsonify({"error": "Message too long. Max 500 characters."}), 400

    try:
        response = rag_chain.invoke({"input": msg})
    except Exception as e:
        logger.error("RAG chain error: %s", e)
        return jsonify({"error": "Something went wrong. Please try again."}), 500

    sources = []
    for doc in response.get("context", []):
        meta  = doc.metadata
        src   = meta.get("source", "Unknown source")
        page  = meta.get("page")
        label = f"{src}, p.{int(page) + 1}" if page is not None else src
        if label not in sources:
            sources.append(label)

    return jsonify({"answer": response["answer"], "sources": sources})


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found."}), 404


@app.errorhandler(429)
def rate_limited(e):
    return jsonify({"error": "Too many requests. Please slow down."}), 429


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
