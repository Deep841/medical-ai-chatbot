# medical-ai-chatbot
# 🧠 Medical AI Chatbot

Hi, my name is **Deep** — and welcome to the **Medical AI Chatbot** repository! 🩺

This project is a fully functional end-to-end AI-powered medical chatbot that leverages advanced NLP techniques, semantic search, and large language models (LLMs) to assist users with medical queries using data extracted from authoritative medical sources.

---

## 📚 Knowledge Base

We use **The Gale Encyclopedia of Medicine (Second Edition, Volume One)** as our primary medical knowledge base.

* The entire PDF is parsed and processed.
* Data is embedded using **HuggingFace models**.
* Stored in a **Pinecone vector database** hosted on the cloud (as the dataset is large, local vector storage is not suitable).

---

## 🛠️ Tech Stack

| Component       | Technology                                    |
| --------------- | --------------------------------------------- |
| Vector DB       | Pinecone (cloud-based, semantic vector index) |
| Embedding Model | `sentence-transformers/all-MiniLM-L6-v2`      |
| Language Model  | OpenAI GPT / HuggingFace FLAN-T5 (fallback)   |
| Framework       | LangChain                                     |
| UI              | Flask + HTML/CSS                              |
| Deployment      | Localhost (simple deployment)                 |

---

## 📦 Folder Structure

```bash
medical-ai-chatbot/
├── app.py                  # Flask app
├── src/                    # Source code
│   ├── helper.py           # Utility functions
│   └── constants.py        # All static values
├── templates/chat.html     # HTML UI
├── static/style.css        # Styling
├── research/               # Notebook and step-by-step experimentation
├── requirements.txt        # Dependencies
└── store_index.py          # Script to create and store Pinecone index
```

---

## 🚀 How It Works

### 🔧 Backend

1. **PDF Parsing**: Using `PyPDFLoader` and `DirectoryLoader`, extract medical knowledge from the encyclopedia.
2. **Text Chunking**: Divide content into meaningful chunks using `RecursiveCharacterTextSplitter`.
3. **Embeddings**: Generate 384-dim embeddings using HuggingFace models.
4. **Vector DB**: Store embeddings in Pinecone for fast and scalable semantic search.
5. **Query Flow**:

   * User query -> converted to embedding
   * Search vector DB for similar chunks
   * Feed relevant chunks + query into LLM
   * Return concise medical answer

### 💬 Frontend

* Flask-powered UI that allows users to ask questions.
* Responses displayed from either OpenAI or local HuggingFace models (fallback).
* Styling using static CSS and HTML templates.

---

## 💡 Key Features

* 📚 Handles a large-scale PDF medical knowledge base.
* ☁️ Cloud-based semantic search using Pinecone.
* 🤖 Supports both OpenAI API and local LLMs.
* 🧩 Modular code structure (suitable for reuse & expansion).
* ⚡ Fast and responsive interface.

---

## ⚙️ Setup Instructions

```bash
git clone https://github.com/Deep841/medical-ai-chatbot.git
cd medical-ai-chatbot

# Create a virtual environment
conda create -n medibot python=3.10 -y
conda activate medibot

# Install dependencies
pip install -r requirements.txt

# Run backend index creation (one-time)
python store_index.py

# Start Flask app
python app.py
```

Visit: `http://localhost:8080`

---

## 🔑 Environment Variables (.env)

Make sure to create a `.env` file with:

```bash
HUGGINGFACEHUB_API_TOKEN=hf_...
PINECONE_API_KEY=pc_...
OPENAI_API_KEY=sk_...
```

---

## 🧪 Development Notes

* Used `FLAN-T5-Small` as a fallback local LLM when OpenAI API had issues.
* Integrated `sentence-transformers` carefully due to version mismatches.
* Created semantic vector index using 384-dim embedding (important for Pinecone compatibility).
* Notebook experimentation first, then transitioned to modular Python codebase.
* UI built using a free HTML/CSS template.
* Successfully tested query answers like: `What is Acromegaly and Gigantism?`

---

## 🤯 Challenges Faced

* Version conflicts with `sentence-transformers`, `transformers`, and `huggingface_hub`.
* Switched to using HuggingFace LLM due to OpenAI API quota limits.
* Cloud cost consideration led to mixed OpenAI (API) + local fallback LLM setup.

---

## 📸 Screenshots

> 📍 \[Add screenshots in README after running the UI locally. Add a folder `/screenshots` if needed.]

---

## 🧠 Learnings

* Vector databases scale better for large documents.
* LLM context length and model size matter.
* Efficient retrieval-augmented generation (RAG) architecture is critical.
* Open-source alternatives can be used when API keys are limited or quota-bound.

---

## 📌 Future Enhancements

* Streamlit-based UI
* Add multilingual medical query support
* Integration with speech-to-text
* More robust fallback strategy for LLMs

---

## 🙌 Final Words

Thank you for checking out the **Medical AI Chatbot** project. It's been an incredible journey working through real-world problems, debugging, and learning how modern AI tools can come together to build powerful healthcare solutions. 💙

---

> 💬 If you liked the project, give it a ⭐ on GitHub and feel free to fork it!

---

*– Made with 💡 by Deep on July 16, 2025*
