import streamlit as st
import os
import sys
import base64  # Penting untuk membaca gambar
import io
from gtts import gTTS

# --- 1. FIX DATABASE ---
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

# --- 2. CONFIG HALAMAN ---
st.set_page_config(
    page_title="Asisten Balmon", 
    page_icon="📡", 
    layout="centered"
)

# --- 3. CSS AGAR TAMPILAN RAPI & BERSIH ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

    /* Background Putih */
    .stApp { background-color: #ffffff !important; }
    
    /* Paksa Huruf Jadi Hitam/Gelap */
    html, body, p, li, h1, h2, h3, h4, span, div {
        font-family: 'Inter', sans-serif;
        color: #333333 !important;
    }

    /* Hilangkan Header Streamlit */
    header[data-testid="stHeader"] { visibility: hidden; height: 0%; }
    .stDeployButton, #MainMenu, footer { display:none; }
    
    .block-container { padding-top: 2rem; padding-bottom: 5rem; }

    /* Bubble Chat User & Bot */
    div[data-testid="stChatMessage"] {
        background-color: #f8f9fa; 
        border: 1px solid #e0e0e0;
        border-radius: 15px;
        padding: 10px;
    }
    
    /* Tombol Kirim */
    button[kind="primary"] {
        background-color: #006fb0 !important;
        border: none;
        color: white !important;
    }
    </style>
""", unsafe_allow_html=True)

# --- 4. FUNGSI LOAD GAMBAR (KUNCI AGAR LOGO MUNCUL) ---
def get_img_as_base64(file):
    try:
        with open(file, "rb") as f:
            data = f.read()
        return base64.b64encode(data).decode()
    except Exception as e:
        return None

# --- 5. HEADER DENGAN LOGO ---
logo_filename = "logo_komdigi.png"  # Sesuai nama file di screenshot Anda
img_base64 = get_img_as_base64(logo_filename)

if img_base64:
    # Jika gambar berhasil dibaca, tampilkan dengan HTML Base64
    st.markdown(
        f"""
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #006fb0;">
            <img src="data:image/png;base64,{img_base64}" alt="Logo" style="height: 60px; width: auto;">
            <div>
                <h1 style="margin: 0; color: #006fb0 !important; font-size: 1.5rem; font-weight: 700;">Asisten AI</h1>
                <h2 style="margin: 0; color: #555 !important; font-size: 0.9rem; font-weight: 400;">Balai Monitor SFR Kelas I Samarinda</h2>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )
else:
    # Fallback jika gambar gagal dimuat
    st.markdown("### 📡 Asisten Balmon Samarinda")

# --- 6. API KEY ---
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    try:
        api_key = st.secrets["GROQ_API_KEY"]
    except:
        st.error("⚠️ API Key Error.")
        st.stop()

client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# --- 7. DATABASE & RAG ---
DB_PATH = "./chroma_db_fix"

@st.cache_resource
def get_vectorstore():
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Cek DB yang sudah ada
    if os.path.exists(DB_PATH):
        try:
            db = Chroma(persist_directory=DB_PATH, embedding_function=embedding_function)
            if len(db.get()['ids']) > 0: return db
        except: pass 
    
    # Scan Dokumen Baru
    documents = []
    for root, dirs, files in os.walk("."):
        for file in files:
            full_path = os.path.join(root, file)
            try:
                if file.lower().endswith(".pdf"): documents.extend(PyPDFLoader(full_path).load())
                elif file.lower().endswith(".docx"): documents.extend(Docx2txtLoader(full_path).load())
                elif file.lower().endswith(".txt") and "requirements" not in file: 
                     documents.extend(TextLoader(full_path, encoding='utf-8').load())
            except: pass
    
    if not documents: return None
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    db = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory=DB_PATH)
    return db

db = get_vectorstore()

# --- 8. LOGIKA CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if message["role"] == "assistant" and "audio" in message:
             st.audio(message["audio"], format="audio/mp3")

if user_input := st.chat_input("Tanyakan sesuatu..."):
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    konteks = ""
    if db:
        try:
            docs = db.similarity_search(user_input, k=3)
            konteks = "\n\n".join([d.page_content for d in docs])
        except: konteks = ""

    system_prompt = f"""
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
            
            # TTS Generation
            tts = gTTS(text=response_text, lang='id')
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            st.audio(audio_buffer, format="audio/mp3")
            
            st.session_state.messages.append({
                "role": "assistant", 
                "content": response_text,
                "audio": audio_buffer
            })
        except Exception as e:
            st.error(f"Error: {e}")