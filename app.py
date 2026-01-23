import streamlit as st
import os
import sys

# --- 1. FIX DATABASE ---
try:
    __import__('pysqlite3')
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

from openai import OpenAI
# Import alat baca PDF dan WORD
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- 2. SETUP HALAMAN ---
st.set_page_config(page_title="Asisten Balmon", page_icon="📡")

# --- CSS DESAIN ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
    
    header[data-testid="stHeader"] { visibility: hidden; height: 0%; }
    .stDeployButton, #MainMenu, footer { display:none; }
    .block-container { padding-top: 2rem; padding-bottom: 5rem; }

    .st-emotion-cache-16idsys p { background-color: #006fb0 !important; color: white !important; }
    .st-emotion-cache-16idsys svg { fill: #006fb0 !important; }
    .stChatInputContainer { border-color: #006fb0 !important; }
    button[kind="primary"] { background-color: #006fb0 !important; border: none; color: white !important; }
    button[kind="primary"]:hover { background-color: #005082 !important; }
    h1 { color: #006fb0 !important; font-size: 1.8rem !important; }
    </style>
""", unsafe_allow_html=True)

st.title("📡 Chatbot Balmon Samarinda")

# --- 3. API KEY ---
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    try:
        api_key = st.secrets["GROQ_API_KEY"]
    except:
        st.error("⚠️ API Key Error.")
        st.stop()

client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

# --- 4. DATABASE (SUPPORT PDF & WORD) ---
DB_PATH = "./chroma_db_fix"

@st.cache_resource
def get_vectorstore():
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Cek DB lama
    if os.path.exists(DB_PATH):
        try:
            db = Chroma(persist_directory=DB_PATH, embedding_function=embedding_function)
            if len(db.get()['ids']) > 0:
                return db
        except:
            pass 
    
    # --- SCAN FILE (PDF & WORD) ---
    documents = []
    
    for root, dirs, files in os.walk("."):
        for file in files:
            full_path = os.path.join(root, file)
            try:
                # Jika PDF
                if file.lower().endswith(".pdf"):
                    loader = PyPDFLoader(full_path)
                    documents.extend(loader.load())
                
                # Jika WORD (.docx)
                elif file.lower().endswith(".docx"):
                    loader = Docx2txtLoader(full_path)
                    documents.extend(loader.load())
            except:
                pass # Lewati file yang error/rusak
    
    if not documents:
        return None

    # Proses Database
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    db = Chroma.from_documents(documents=splits, embedding=embedding_function, persist_directory=DB_PATH)
    
    return db

# Load Database
db = get_vectorstore()

# --- 5. CHAT INTERFACE ---
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if user_input := st.chat_input("Tanya seputar layanan Balmon..."):
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    konteks = ""
    if db:
        try:
            docs = db.similarity_search(user_input, k=4)
            konteks = "\n\n".join([d.page_content for d in docs])
        except:
            pass

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
            stream = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_input}],
                temperature=0.5, stream=True
            )
            response = st.write_stream(stream)
            st.session_state.messages.append({"role": "assistant", "content": response})
        except:
            st.error("Error koneksi.")