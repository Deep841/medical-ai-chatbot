import os
import logging
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
from src.prompt import system_prompt

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
TESTING = os.environ.get("TESTING") == "1"

# ── Validate env vars ─────────────────────────────────────────────────────
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
GITHUB_TOKEN     = os.environ.get("GITHUB_NEW_API_TOKEN")

if not TESTING:
    if not PINECONE_API_KEY:
        raise RuntimeError("PINECONE_API_KEY is not set.")
    if not GITHUB_TOKEN:
        raise RuntimeError("GITHUB_NEW_API_TOKEN is not set.")
    os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY

# ── App ────────────────────────────────────────────────────────────────────
app = Flask(__name__, template_folder="template")
app.config["JSON_SORT_KEYS"] = False
CORS(app, resources={r"/get": {"origins": "*"}, r"/api/*": {"origins": "*"}})

limiter = Limiter(
    get_remote_address, app=app,
    default_limits=["200 per day", "30 per hour"],
    storage_uri="memory://"
)

# ── RAG setup ──────────────────────────────────────────────────────────────
if TESTING:
    logger.info("Test mode enabled: using dummy retriever and LLM")

    class DummyRetriever:
        def invoke(self, query):
            return []

    class DummyLLM:
        def invoke(self, prompt):
            class DummyResponse:
                content = "This is a test answer from MediBot."
            return DummyResponse()

    retriever = DummyRetriever()
    llm = DummyLLM()
else:
    logger.info("Initialising embeddings...")
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=GITHUB_TOKEN,
        openai_api_base="https://models.inference.ai.azure.com"
    )

    logger.info("Connecting to Pinecone...")
    docsearch = PineconeVectorStore.from_existing_index(
        index_name="medicalbot-v2", embedding=embeddings
    )
    retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 4})

    llm = ChatOpenAI(
        model="gpt-4o-mini", temperature=0.4, max_tokens=600,
        openai_api_key=GITHUB_TOKEN,
        openai_api_base="https://models.inference.ai.azure.com"
    )

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
])

# ── In-memory session store (keyed by session_id) ─────────────────────────
# Each session stores last 6 messages (3 turns)
sessions: dict[str, list] = {}

# ── Medical intent keywords (lightweight classifier) ──────────────────────
MEDICAL_KEYWORDS = {
    "symptom","disease","condition","treatment","medicine","drug","dose","pain",
    "fever","infection","cancer","diabetes","heart","blood","surgery","doctor",
    "hospital","diagnosis","therapy","vaccine","virus","bacteria","chronic",
    "acute","syndrome","disorder","injury","wound","allergy","prescription",
    "anatomy","organ","muscle","bone","nerve","skin","lung","kidney","liver",
    "brain","stomach","headache","headace","head","ache","nausea","vomiting",
    "diarrhea","fatigue","cough","rash","swelling","inflammation","hypertension",
    "cholesterol","asthma","arthritis","depression","anxiety","mental","health",
    "medical","clinical","patient","nursing","pharmacy","antibiotic","vitamin",
    "hormone","what is","how to treat","causes of","signs of","symptoms of",
    "cure for","tell me about","explain","define","describe","acromegaly",
    "migraine","appendicitis","ibuprofen","paracetamol","aspirin","insulin",
    "blood pressure","heart rate","pulse","temperature","weight","diet",
    "nutrition","exercise","sleep","stress","immune","autoimmune","genetic",
}

def is_medical_query(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in MEDICAL_KEYWORDS)

# ── Routes ─────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("chat.html")

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "gpt-4o-mini", "index": "medicalbot-v2"})

@app.route("/get", methods=["POST"])
@app.route("/api/get", methods=["POST"])
@limiter.limit("20 per minute")
def chat():
    msg        = request.form.get("msg", "").strip()
    session_id = request.form.get("session_id", "default")

    if not msg:
        return jsonify({"error": "Message cannot be empty."}), 400
    if len(msg) > 500:
        return jsonify({"error": "Message too long. Max 500 characters."}), 400

    # Medical intent check
    if not is_medical_query(msg):
        return jsonify({
            "answer": "I can only answer medical and health-related questions. Please ask me about symptoms, conditions, treatments, or medications.",
            "sources": [],
            "snippets": []
        })

    # Retrieve relevant docs
    try:
        docs = retriever.invoke(msg)
    except Exception as e:
        logger.error("Retrieval error: %s", e)
        return jsonify({"error": "Retrieval failed. Please try again."}), 500

    # Build context string
    context = "\n\n".join(doc.page_content for doc in docs)

    # Get or create session history
    history = sessions.get(session_id, [])

    # Build messages for LLM
    try:
        chain_input = {
            "input": msg,
            "context": context,
            "chat_history": history,
        }
        response = llm.invoke(prompt.format_messages(**chain_input))
        answer = response.content
    except Exception as e:
        logger.error("LLM error: %s", e)
        return jsonify({"error": "Something went wrong. Please try again."}), 500

    # Update session history (keep last 6 messages = 3 turns)
    history.append(HumanMessage(content=msg))
    history.append(AIMessage(content=answer))
    sessions[session_id] = history[-6:]

    # Build sources + snippets
    sources, snippets = [], []
    for doc in docs:
        meta  = doc.metadata
        src   = meta.get("source", "Unknown source")
        page  = meta.get("page")
        label = f"{src}, p.{int(page) + 1}" if page is not None else src
        if label not in sources:
            sources.append(label)
            # Return first 200 chars of the chunk as a snippet
            snippets.append({
                "source": label,
                "text": doc.page_content[:200].strip() + "..."
            })

    logger.info("Query: %s | Session: %s | Sources: %s", msg[:60], session_id, sources)

    return jsonify({"answer": answer, "sources": sources, "snippets": snippets})

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json(silent=True) or {}
    logger.info("Feedback: %s | msg: %s", data.get("rating"), data.get("msg", "")[:60])
    return jsonify({"status": "ok"})

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
