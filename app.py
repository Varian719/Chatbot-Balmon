__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

import streamlit as st
import os
import base64
import io
import asyncio
import json
import hashlib
import shutil
import time  # Tambahan untuk delay pada respons chatbot
from datetime import datetime

# --- LIBRARY UTAMA ---
import edge_tts
import firebase_admin
from firebase_admin import credentials, db as firebase_db
from openai import OpenAI
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- 1. KONFIGURASI HALAMAN ---
st.set_page_config(
    page_title="Sobat Digi", 
    page_icon="📡", 
    layout="centered"
)

# --- 2. INIT FIREBASE ---
def init_firebase():
    if not firebase_admin._apps:
        try:
            firebase_json_str = os.environ.get("FIREBASE_JSON")
            if not firebase_json_str and "FIREBASE_JSON" in st.secrets:
                firebase_json_str = st.secrets["FIREBASE_JSON"]
            
            if not firebase_json_str:
                return 

            cred_dict = json.loads(firebase_json_str)
            cred = credentials.Certificate(cred_dict)
            project_id = cred_dict.get("project_id")
            db_url = f"https://{project_id}-default-rtdb.firebaseio.com/"
            
            firebase_admin.initialize_app(cred, {'databaseURL': db_url})
            print(f"✅ Firebase Terhubung: {project_id}")
        except Exception as e:
            print(f"Gagal koneksi Firebase: {e}")

init_firebase()

def save_chat_to_firebase(user_text, bot_text):
    try:
        if firebase_admin._apps:
            ref = firebase_db.reference('chat_history')
            ref.push({
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'user': user_text,
                'assistant': bot_text,
                'platform': 'Hugging Face Space'
            })
    except: pass

# --- 3. AUDIO (ASYNC WRAPPER) ---
async def _generate_audio_async(text, voice="id-ID-GadisNeural"):
    communicate = edge_tts.Communicate(text, voice)
    mp3_fp = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            mp3_fp.write(chunk["data"])
    mp3_fp.seek(0)
    return mp3_fp

def generate_audio_sync(text):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    if loop.is_running():
        future = asyncio.run_coroutine_threadsafe(_generate_audio_async(text), loop)
        return future.result()
    else:
        return loop.run_until_complete(_generate_audio_async(text))

# --- 4. CSS TAMPILAN ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    /* 1. FORCE BACKGROUND PUTIH TOTAL */
    .stApp { 
        background-color: #ffffff !important; 
    }
    
    html, body, p, li, h1, h2, h3, h4, span, div, label { 
        font-family: 'Inter', sans-serif; 
        color: #333333; 
    }
    
    /* HIDE HEADER BAWAAN */
    header[data-testid="stHeader"] { visibility: hidden; height: 0%; }
    .stDeployButton, #MainMenu, footer { display:none; }
    
    .block-container { 
        padding-top: 1rem; 
        padding-bottom: 9rem; /* Space untuk footer */
    }
    
    /* --- CHAT BUBBLES --- */
    div[data-testid="stChatMessage"] { 
        padding: 15px; 
        border-radius: 12px; 
        margin-bottom: 15px; 
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    /* STYLE UNTUK CHAT BOT (ASSISTANT) */
    div[data-testid="stChatMessage"]:has(img[alt="assistant avatar"]),
    div[data-testid="stChatMessage"]:has(img[alt="logo_komdigi.png"]) { 
        background-color: #ffffff !important; 
        border: 1px solid #e0e0e0 !important;
        border-left: 5px solid #006fb0 !important; /* Highlight Kiri */
        color: #333333 !important;
    }
    
    /* STYLE UNTUK CHAT USER */
    div[data-testid="stChatMessage"]:has(img[alt="user avatar"]),
    div[data-testid="stChatMessage"]:has(img[alt="user.png"]),
    div[data-testid="stChatMessage"]:has(div[data-testid="chatAvatarIcon-user"]) { 
        background-color: #e3f2fd !important; /* Biru muda terang */
        border: 1px solid #bbdefb !important;
        border-right: 5px solid #2196f3 !important; /* Highlight Kanan untuk User */
        color: #333333 !important;
    }

    /* Memaksa warna font di dalam chat konten tetap gelap */
    div[data-testid="stChatMessageContent"] {
        color: #333333 !important;
    }
    
    /* --- FOOTER (INPUT AREA) --- */
    div[data-testid="stBottom"] {
        background-color: #ffffff !important;
        border-top: 1px solid #e0e0e0;
        padding: 20px 0;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        box-shadow: none !important;
    }

    div[data-testid="stBottomBlockContainer"] {
        background-color: #ffffff !important;
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px;
        box-shadow: none !important;
    }

    /* Paksa semua elemen di dalam footer jadi putih backgroundnya, tanpa shadow hitam */
    div[data-testid="stBottom"] > div {
        background-color: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
    }
    
    /* --- INPUT BOX (TEXTAREA) --- */
    .stChatInput textarea {
        background-color: #ffffff !important; 
        color: #333333 !important;
        border: none !important;
        border-radius: 25px !important;
        padding: 12px 20px !important;
        box-shadow: none !important;
        font-size: 16px !important;
        outline: none !important;
    }
    
    .stChatInput textarea:focus {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
    }
    
    /* Placeholder */
    .stChatInput textarea::placeholder {
        color: #999999 !important;
    }
    
    /* Tombol Kirim (Icon) */
    button[kind="primary"] {
        background-color: #006fb0 !important;
        border: none !important;
        border-radius: 50% !important;
        color: white !important;
        height: 40px !important;
        width: 40px !important;
        margin-left: 10px !important;
        transition: background-color 0.3s ease;
        box-shadow: none !important;
        outline: none !important;
    }
    button[kind="primary"]:hover {
        background-color: #005082 !important;
    }
    button[kind="primary"] svg {
        fill: white !important;
    }

    /* Remove any potential black elements in chat input container */
    .stChatInput {
        background-color: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
        outline: none !important;
    }

    /* Mobile Adjustments */
    @media only screen and (max-width: 600px) {
        .block-container { padding-top: 0.5rem !important; padding-bottom: 10rem !important; }
        div[data-testid="stChatMessage"] { padding: 10px !important; font-size: 0.9rem !important; }
        .custom-header h1 { font-size: 1.2rem !important; }
        .custom-header h2 { font-size: 0.8rem !important; }
        .custom-header img { height: 40px !important; }
        div[data-testid="stBottom"] { padding: 15px 0; }
        div[data-testid="stBottomBlockContainer"] { padding: 0 15px; }
        .stChatInput textarea { font-size: 14px !important; }
    }
    </style>
""", unsafe_allow_html=True)

# --- 5. HEADER ---
def get_img_as_base64(file_path):
    with open(file_path, "rb") as f: data = f.read()
    return base64.b64encode(data).decode()

logo_filename = "logo_komdigi.png" 
if os.path.exists(logo_filename):
    img_base64 = get_img_as_base64(logo_filename)
    st.markdown(f"""
        <div class="custom-header" style="background: white; padding: 15px; border-radius: 10px; border-bottom: 3px solid #006fb0; display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <img src="data:image/png;base64,{img_base64}" alt="Logo" style="height: 55px; width: auto;">
            <div>
                <h1 style="margin: 0; color: #006fb0 !important; font-size: 1.4rem; font-weight: 700;">Sobat Digi</h1>
                <h2 style="margin: 0; color: #555555 !important; font-size: 0.9rem; font-weight: 400;">Balai Monitor SFR Kelas I Samarinda</h2>
            </div>
        </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("<h1 style='color:#006fb0; text-align:center;'>📡 Sobat Digi Balmon</h1>", unsafe_allow_html=True)

# --- 6. API KEY ---
api_key = os.environ.get("GROQ_API_KEY") or st.secrets.get("GROQ_API_KEY")
if not api_key:
    st.error("⚠️ API Key Error: GROQ_API_KEY tidak ditemukan.")
    st.stop()
client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# --- 7. DATABASE AUTO-UPDATE ---
DB_PATH = "./chroma_db_fix"
METADATA_PATH = "db_metadata.json"

def get_files_signature(folder_path="."):
    file_signatures = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if "chroma_db" in root or file.startswith("."): continue
            if file.lower().endswith(('.pdf', '.docx', '.txt')) and "requirements" not in file:
                full_path = os.path.join(root, file)
                mtime = os.path.getmtime(full_path)
                file_signatures.append(f"{file}_{mtime}")
    return hashlib.md5("".join(sorted(file_signatures)).encode()).hexdigest()

@st.cache_resource
def get_vectorstore():
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    current_signature = get_files_signature(".")
    last_signature = ""
    
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, "r") as f:
            try: last_signature = json.load(f).get("signature", "")
            except: pass

    db_exists = os.path.exists(DB_PATH) and len(os.listdir(DB_PATH)) > 0
    is_changed = current_signature != last_signature

    if db_exists and not is_changed:
        print("✅ Dokumen tidak berubah. Load DB lama.")
        try: return Chroma(persist_directory=DB_PATH, embedding_function=embedding_function)
        except: pass
    
    print("🔄 Update Database...")
    if os.path.exists(DB_PATH): shutil.rmtree(DB_PATH, ignore_errors=True)

    documents = []
    for root, dirs, files in os.walk("."):
        if "chroma_db" in root: continue
        for file in files:
            full_path = os.path.join(root, file)
            try:
                if file.lower().endswith(".pdf"): documents.extend(PyPDFLoader(full_path).load())
                elif file.lower().endswith(".docx"): documents.extend(Docx2txtLoader(full_path).load())
                elif file.lower().endswith(".txt") and "requirements" not in file: documents.extend(TextLoader(full_path, encoding='utf-8').load())
            except: pass
    
    if not documents: return None
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    db = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory=DB_PATH)
    
    with open(METADATA_PATH, "w") as f: json.dump({"signature": current_signature}, f)
    return db

db = get_vectorstore()

# --- 8. LOGIKA CHAT ---

# --- KONFIGURASI ICON (UBAH DISINI) ---
# Gunakan URL gambar, path file lokal, atau Emoji
ICON_USER = "user.png"              # Bisa ganti "user.png" jika sudah upload file
ICON_BOT = "logo_komdigi.png" # Menggunakan file logo yg sudah ada di folder

if "messages" not in st.session_state:
    st.session_state.messages = []

# TAMPILKAN HISTORY CHAT (Dengan Icon Baru)
for message in st.session_state.messages:
    # Tentukan avatar berdasarkan role
    avatar_icon = ICON_USER if message["role"] == "user" else ICON_BOT
    
    with st.chat_message(message["role"], avatar=avatar_icon):
        st.markdown(message["content"])
        if message["role"] == "assistant" and "audio" in message: 
            st.audio(message["audio"], format="audio/mp3")

# INPUT USER
if user_input := st.chat_input("Tanyakan sesuatu..."):
    st.session_state.messages.append({"role": "user", "content": user_input})
    
    # Tampilkan Chat User saat ini (Dengan Icon User)
    with st.chat_message("user", avatar=ICON_USER):
        st.markdown(user_input)

    konteks = ""
    if db:
        try:
            docs = db.similarity_search(user_input, k=3)
            konteks = "\n\n".join([d.page_content for d in docs])
        except: konteks = ""

    system_prompt = f"""Kamu adalah Sobat Digi, Asisten AI Balmon Samarinda.
    
    DATA DARI DOKUMEN INTERNAL:
    {konteks}
         INSTRUKSI:

    1. Jawab pertanyaan user berdasarkan DATA di atas.

    2. Jika tidak ada di data, gunakan pengetahuan umum yang relevan (seputar telekomunikasi/radio, perizinan, balai monitor, komdigi, kominfo, dan semua yang memiliki keterkaitan dengan balai monitor).

    3. Tolak pertanyaan yang melenceng jauh (masak, politik, dll).

    4. Jika tidak ada di data, jangan beri tahu user bahwa tidak ada di dokumen, cari saja jawabannya (kembali ke nomor 2).

    5. Berikan info contact person WA: 0856-4828-3012 jika user ingin informasi lebih lanjut.

    6. Gunakan Bahasa Indonesia yang formal dan sopan.

    7. Anda adalah asisten AI Balai monitor spektrum frekuensi radio kelas 1 Samarinda

    """ 

    # Tampilkan Respon Bot (Dengan Icon Bot)
    with st.chat_message("assistant", avatar=ICON_BOT):
        try:
            history_payload = [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages[-5:]]
            messages_final = [{"role": "system", "content": system_prompt}] + history_payload

            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages_final,
                temperature=0.3,
                stream=True 
            )
            
            response_placeholder = st.empty()
            full_response = ""
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    response_placeholder.markdown(full_response + "▌")
                    time.sleep(0.05) 
            
            response_placeholder.markdown(full_response)
            
            # Generate Audio
            with st.spinner("Memproses suara..."):
                audio_buffer = generate_audio_sync(full_response)
                st.audio(audio_buffer, format="audio/mp3")
            
            # Simpan ke Session State
            st.session_state.messages.append({
                "role": "assistant", 
                "content": full_response,
                "audio": audio_buffer
            })
            
            # Simpan ke Firebase
            save_chat_to_firebase(user_input, full_response)

        except Exception as e:
            st.error(f"Error: {e}")