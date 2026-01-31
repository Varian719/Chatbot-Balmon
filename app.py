import streamlit as st
import os
import sys
import base64
import io
from gtts import gTTS  # Library Text-to-Speech Google

# --- 1. FIX DATABASE (WAJIB UNTUK HUGGING FACE) ---
# Mengatasi error versi SQLite di server Linux
try:
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

from openai import OpenAI
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- 2. KONFIGURASI HALAMAN ---
st.set_page_config(
    page_title="Asisten Balmon", 
    page_icon="📡", 
    layout="centered"
)

# --- 3. DESAIN TAMPILAN (CSS) ---
st.markdown("""
    <style>
    /* Import Font Inter */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

    /* 1. BACKGROUND PUTIH BERSIH */
    .stApp {
        background-color: #ffffff !important;
    }
    
    /* 2. TEKS HITAM (Agar kontras) */
    html, body, p, li, h1, h2, h3, h4, span, div, label {
        font-family: 'Inter', sans-serif;
        color: #333333 !important;
    }

    /* 3. SEMBUNYIKAN HEADER BAWAAN */
    header[data-testid="stHeader"] { visibility: hidden; height: 0%; }
    .stDeployButton, #MainMenu, footer { display:none; }
    
    .block-container { padding-top: 2rem; padding-bottom: 5rem; }

    /* 4. BUBBLE CHAT */
    div[data-testid="stChatMessage"] {
        padding: 15px;
        border-radius: 15px;
        margin-bottom: 10px;
        border: 1px solid #e0e0e0;
    }
    
    /* Bubble Asisten (Putih dengan Garis Biru) */
    div[data-testid="stChatMessage"][data-testid="assistant"] {
        background-color: #ffffff;
        border-left: 5px solid #006fb0;
    }

    /* Bubble User (Biru Muda) */
    div[data-testid="stChatMessage"][data-testid="user"] {
        background-color: #f0f8ff;
        border: none;
    }
    
    /* Tombol Kirim */
    button[kind="primary"] {
        background-color: #006fb0 !important;
        border: none;
        color: white !important;
    }
    button[kind="primary"]:hover {
        background-color: #005082 !important;
    }
    
    /* Ikon di tombol kirim */
    button[kind="primary"] p { color: white !important; }
    button[kind="primary"] svg { fill: white !important; }

    /* Audio Player */
    audio { width: 100%; height: 40px; margin-top: 10px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1)); }

    /* --- PERBAIKAN: MEMUTIHKAN CONTAINER INPUT BAWAH --- */
    
    /* Target Container Paling Bawah (stBottom) */
    div[data-testid="stBottom"] {
        background-color: #ffffff !important;
        background: #ffffff !important;
        border-top: 1px solid #e0e0e0; 
    }

    /* Target Block Container di dalamnya (stBottomBlockContainer) */
    div[data-testid="stBottomBlockContainer"] {
        background-color: #ffffff !important;
        background: #ffffff !important;
    }

    /* Pastikan elemen anak di dalam bottom container juga transparan/putih */
    div[data-testid="stBottom"] > div {
        background-color: #ffffff !important;
    }

    /* Area Ketik (Textarea) */
    .stChatInput textarea {
        background-color: #ffffff !important;
        color: #333333 !important;
        border: 1px solid #cccccc !important;
    }
    
    /* Warna Placeholder (Tanyakan sesuatu...) */
    .stChatInput textarea::placeholder {
        color: #888888 !important;
    }
    
    </style>
""", unsafe_allow_html=True)

# --- 4. HEADER DENGAN LOGO ---
def get_img_as_base64(file_path):
    with open(file_path, "rb") as f:
        data = f.read()
    return base64.b64encode(data).decode()

logo_filename = "logo_komdigi.png" # Tampilkan Header

if os.path.exists(logo_filename):
    img_base64 = get_img_as_base64(logo_filename)
    st.markdown(
        f"""
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #006fb0;">
            <img src="data:image/png;base64,{img_base64}" alt="Logo Komdigi" style="height: 65px; width: auto;">
            <div>
                <h1 style="margin: 0; color: #006fb0 !important; font-size: 1.6rem; font-weight: 700; line-height: 1.2;">Asisten AI</h1>
                <h2 style="margin: 0; color: #555555 !important; font-size: 1rem; font-weight: 400;">Balai Monitor SFR Kelas I Samarinda</h2>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )
else:
    st.title("📡 Asisten Balmon Samarinda")

# --- 5. KONEKSI API (GROQ) ---
api_key = os.environ.get("GROQ_API_KEY")

if not api_key:
    try:
        api_key = st.secrets["GROQ_API_KEY"]
    except:
        st.error("⚠️ API Key Error. Cek Settings di Hugging Face.")
        st.stop()

client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# --- 6. DATABASE (OTOMATIS BACA FILE) ---
DB_PATH = "./chroma_db_fix"

@st.cache_resource
def get_vectorstore():
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Cek DB lama
    if os.path.exists(DB_PATH):
        try:
            db = Chroma(persist_directory=DB_PATH, embedding_function=embedding_function)
            if len(db.get()['ids']) > 0: return db
        except: pass
        
    # Scan File Baru (PDF/Word/Txt)
    documents = []
    for root, dirs, files in os.walk("."):
        for file in files:
            full_path = os.path.join(root, file)
            try:
                if file.lower().endswith(".pdf"): 
                    documents.extend(PyPDFLoader(full_path).load())
                elif file.lower().endswith(".docx"): 
                    documents.extend(Docx2txtLoader(full_path).load())
                elif file.lower().endswith(".txt") and "requirements" not in file: 
                    documents.extend(TextLoader(full_path, encoding='utf-8').load())
            except: pass
    
    if not documents: return None
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    db = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory=DB_PATH)
    return db

db = get_vectorstore()

# --- 7. LOGIKA CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# Tampilkan Pesan Lama
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if message["role"] == "assistant" and "audio" in message: 
            st.audio(message["audio"], format="audio/mp3")

# Input User
if user_input := st.chat_input("Tanyakan sesuatu..."):
    # 1. Tampilkan Pertanyaan
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # 2. Cari Data
    konteks = ""
    if db:
        try:
            docs = db.similarity_search(user_input, k=3)
            konteks = "\n\n".join([d.page_content for d in docs])
        except: konteks = ""

    # 3. Instruksi Robot
    system_prompt = f"""  Kamu adalah Asisten AI Balmon Samarinda.
Kamu adalah Asisten AI Balmon Samarinda.
    
        DATA DARI DOKUMEN INTERNAL:
        {konteks}
          INSTRUKSI:

    1. Jawab pertanyaan user berdasarkan DATA di atas.
    2. Jika tidak ada di data, gunakan pengetahuan umum yang relevan (seputar telekomunikasi/radio).
    3. Tolak pertanyaan yang melenceng jauh (masak, politik, dll).
    4. Jika tidak ada di data, jangan beri tahu user bahwa tidak ada di dokumen,cari saja jawabannya
    5. dan juga beri info tentang contact person wa:0856-4828-3012 jika anda tidak tahu jawabannya lalu user ingin informasi lebih lanjut
    6. Gunakan Bahasa yang formal dan sopan
    """

    # 4. Generate Jawaban + Suara
    with st.chat_message("assistant"):
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.3,
                stream=False
            )
            response_text = completion.choices[0].message.content
            st.markdown(response_text)
            
            # Buat Suara
            tts = gTTS(text=response_text, lang='id')
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            st.audio(audio_buffer, format="audio/mp3")
            
            # Simpan ke Memori
            st.session_state.messages.append({
                "role": "assistant", 
                "content": response_text,
                "audio": audio_buffer
            })

        except Exception as e:
            st.error(f"Error: {e}")