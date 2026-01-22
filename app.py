import streamlit as st
import os
import sys

# --- 1. FIX DATABASE (Agar jalan di Server Linux Hugging Face) ---
try:
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

from openai import OpenAI
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- 2. SETUP HALAMAN ---
st.set_page_config(page_title="Asisten Balmon", page_icon="📡")
st.title("📡 Chatbot Balmon Samarinda")

# --- 3. AMBIL API KEY ---
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    try:
        api_key = st.secrets["GROQ_API_KEY"]
    except:
        st.error("⚠️ API Key tidak ditemukan. Mohon cek Settings -> Secrets.")
        st.stop()

client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# --- 4. SIAPKAN DATABASE (VERSI CARI DALAM FOLDER) ---
DB_PATH = "./chroma_db_fix"

@st.cache_resource
def get_vectorstore():
    # Setup Embeddings
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Cek apakah database sudah terbentuk
    if os.path.exists(DB_PATH):
        try:
            db = Chroma(persist_directory=DB_PATH, embedding_function=embedding_function)
            if len(db.get()['ids']) > 0:
                return db
        except:
            pass 
    
    # --- LOGIKA BARU: Cari PDF sampai ke dalam folder-folder ---
    st.info("🔄 Sedang memindai semua folder untuk mencari PDF...")
    documents = []
    pdf_count = 0
    
    # os.walk akan menelusuri folder 'dataset website balmon' secara otomatis
    for root, dirs, files in os.walk("."):
        for file in files:
            if file.lower().endswith(".pdf"):
                full_path = os.path.join(root, file)
                try:
                    loader = PyPDFLoader(full_path)
                    docs = loader.load()
                    documents.extend(docs)
                    pdf_count += 1
                except:
                    pass
    
    if pdf_count == 0:
        st.warning("⚠️ Tidak ada file PDF ditemukan di folder manapun!")
        return None
    else:
        st.success(f"✅ Ditemukan {pdf_count} file PDF. Sedang memproses...")

    # Pecah teks jadi potongan kecil
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    
    # Simpan ke memori
    db = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory=DB_PATH)
    st.success("✅ Database Siap!")
    return db

# Load Database
db = get_vectorstore()

# --- 5. TAMPILAN CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- 6. PROSES JAWAB ---
if user_input := st.chat_input("Tanya seputar layanan Balmon..."):
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # Cari Konteks
    konteks = ""
    if db:
        try:
            docs = db.similarity_search(user_input, k=4)
            konteks = "\n\n".join([d.page_content for d in docs])
        except:
            konteks = ""

    # ============================================================
    # 🔴 PROMPT ASLI (TIDAK DIUBAH) 🔴
    # ============================================================
    system_prompt = f"""
    Kamu adalah Asisten AI Balmon Samarinda.
    
    DATA DARI DOKUMEN INTERNAL:
    {konteks}
    
    INSTRUKSI:
    1. Jawab pertanyaan user berdasarkan DATA di atas.
    2. Jika tidak ada di data, gunakan pengetahuan umum yang relevan (seputar telekomunikasi/radio).
    3. Tolak pertanyaan yang melenceng jauh (masak, politik, dll).
    4. Jika tidak ada di data, jangan beri tahu user bahwa tidak ada di dokumen,cari saja jawabannya
    5. dan juga beri info tentang contact person wa:0856-4828-3012 jikalau user ingin informasi lebih lanjut
    6. Gunakan Bahasa yang formal dan sopan
    """

    with st.chat_message("assistant"):
        try:
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.5,
                stream=True,
            )
            response = st.write_stream(stream)
            st.session_state.messages.append({"role": "assistant", "content": response})
        except Exception as e:
            st.error(f"Error API: {e}")