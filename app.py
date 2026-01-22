import streamlit as st
import os
import sys

# --- FIX SQLITE ---
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

# --- KONFIGURASI ---
st.set_page_config(page_title="Asisten Balmon", page_icon="📡")
st.title("📡 Chatbot Balmon Samarinda")

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    # Coba cari di secrets sebagai cadangan
    try:
        api_key = st.secrets["GROQ_API_KEY"]
    except:
        st.error("⚠️ API Key hilang. Cek Settings.")
        st.stop()

client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# --- FUNGSI BUILD DATABASE OTOMATIS ---
DB_PATH = "./chroma_db_baru" # Kita pakai nama folder baru biar fresh

@st.cache_resource
def get_vectorstore():
    # 1. Cek apakah database sudah ada dan valid
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    if os.path.exists(DB_PATH):
        try:
            db = Chroma(persist_directory=DB_PATH, embedding_function=embedding_function)
            # Tes baca
            if len(db.get()['ids']) > 0:
                return db
        except:
            pass # Kalau error, kita buat baru di bawah
    
    # 2. Jika belum ada, kita cari file PDF di folder ini
    st.info("🔄 Sedang membangun Database dari file PDF... (Hanya sekali)")
    
    pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]
    if not pdf_files:
        st.error("⚠️ Tidak ada file PDF ditemukan di folder utama! Upload PDF dulu.")
        return None
        
    documents = []
    for pdf in pdf_files:
        try:
            loader = PyPDFLoader(pdf)
            docs = loader.load()
            documents.extend(docs)
        except:
            pass
            
    if not documents:
        return None
        
    # Pecah text jadi potongan kecil
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    
    # Simpan ke Chroma
    db = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory=DB_PATH)
    st.success(f"✅ Database berhasil dibuat! ({len(splits)} potongan teks)")
    return db

# Load Database
db = get_vectorstore()

# --- LOGIKA CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Tanya seputar layanan Balmon..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        konteks = ""
        if db:
            docs = db.similarity_search(prompt, k=4)
            konteks = "\n\n".join([d.page_content for d in docs])
            
            # DEBUG: Tampilkan di sidebar apa yang ditemukan database (Opsional)
            with st.sidebar:
                st.write("🔍 **Data Ditemukan:**")
                st.caption(konteks[:500] + "...")

        system_prompt = f"""
        Kamu adalah Asisten AI Balmon Samarinda.
        Gunakan DATA berikut untuk menjawab:
        {konteks}
        
        Jika jawaban tidak ada di data, katakan kamu tidak tahu dengan sopan.
        """

        try:
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                stream=True, 
            )
            response = st.write_stream(stream)
            st.session_state.messages.append({"role": "assistant", "content": response})
        except Exception as e:
            st.error(f"Error: {e}")