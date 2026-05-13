from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os

load_dotenv()

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
GITHUB_TOKEN     = os.environ.get("GITHUB_NEW_API_TOKEN")
INDEX_NAME       = "medicalbot-v2"   # new index — 1536 dim

# ── Load & chunk PDFs ──────────────────────────────────────────────────────
print("Loading PDFs...")
loader = DirectoryLoader("data/", glob="*.pdf", loader_cls=PyPDFLoader)
documents = loader.load()
print(f"Loaded {len(documents)} pages")

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)
chunks = splitter.split_documents(documents)
print(f"Split into {len(chunks)} chunks")

# ── Embeddings via GitHub Models API (no local model) ─────────────────────
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=GITHUB_TOKEN,
    openai_api_base="https://models.inference.ai.azure.com"
)

# ── Create Pinecone index (1536 dim) ───────────────────────────────────────
pc = Pinecone(api_key=PINECONE_API_KEY)
existing = [i.name for i in pc.list_indexes()]

if INDEX_NAME not in existing:
    print(f"Creating index '{INDEX_NAME}'...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    print("Index created.")
else:
    print(f"Index '{INDEX_NAME}' already exists, upserting...")

# ── Upsert in batches ─────────────────────────────────────────────────────
print(f"Upserting {len(chunks)} chunks in batches...")
BATCH = 50
for i in range(0, len(chunks), BATCH):
    batch = chunks[i:i+BATCH]
    PineconeVectorStore.from_documents(
        documents=batch,
        index_name=INDEX_NAME,
        embedding=embeddings
    )
    print(f"  {min(i+BATCH, len(chunks))}/{len(chunks)} chunks upserted")
print("Done! Index ready.")
