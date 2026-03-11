/**
 * POPUP UMUR INTEGRASI FIREBASE
 * Fitur: Inject CSS otomatis, Inject HTML otomatis, Logika Firebase
 */

// 1. IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 2. KONFIGURASI FIREBASE (Sama dengan Admin Panel)
const firebaseConfig = {
    apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
    authDomain: "admin-pelayanan-balmon.firebaseapp.com",
    databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
    projectId: "admin-pelayanan-balmon",
    storageBucket: "admin-pelayanan-balmon.firebasestorage.app",
    messagingSenderId: "1071557110255",
    appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 3. DEFINISI CSS (Disimpan dalam string JS)
const popupStyles = `
    .age-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(5px);
        z-index: 99999; display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: all 0.4s ease;
    }
    .age-overlay.active { opacity: 1; visibility: visible; }
    .age-card {
        background: #fff; padding: 40px 30px; border-radius: 20px;
        width: 90%; max-width: 400px; text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        border-top: 6px solid #006fb0;
        transform: translateY(20px) scale(0.9); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .age-overlay.active .age-card { transform: translateY(0) scale(1); }
    .age-icon-circle {
        width: 70px; height: 70px; background: #f0f8ff; color: #006fb0;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px auto; font-size: 32px;
    }
    .age-card h3 { margin: 0 0 10px 0; color: #1e293b; font-family: sans-serif; font-weight: 800; }
    .age-card p { color: #64748b; font-size: 14px; margin-bottom: 25px; line-height: 1.5; font-family: sans-serif; }
    .age-input {
        width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;
        font-size: 18px; text-align: center; margin-bottom: 20px; outline: none;
        font-weight: 600; color: #006fb0; transition: 0.3s;
    }
    .age-input:focus { border-color: #006fb0; box-shadow: 0 0 0 4px rgba(0, 111, 176, 0.1); }
    .age-btn {
        width: 100%; background: linear-gradient(135deg, #006fb0, #005082); color: white;
        border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer;
        font-size: 16px; transition: 0.3s; font-family: sans-serif;
    }
    .age-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 111, 176, 0.2); }
    .age-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
`;

// 4. FUNGSI INJECT CSS
function injectStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = popupStyles;
    document.head.appendChild(styleSheet);
}

// 5. FUNGSI INJECT HTML
function injectHTML() {
    const htmlContent = `
    <div id="ageOverlay" class="age-overlay">
        <div class="age-card">
            <div class="age-icon-circle">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
            </div>
            <h3>Survei Pengunjung</h3>
            <p>Bantu kami meningkatkan layanan Balmon Samarinda dengan mengisi data usia Anda.</p>
            <input type="number" id="inputUserAge" class="age-input" placeholder="Usia (Tahun)" min="10" max="99">
            <button id="btnSubmitAge" class="age-btn">Kirim Data</button>
            <p style="font-size:11px; color:#94a3b8; margin-top:15px; margin-bottom:0;">🔒 Data Anda anonim & aman.</p>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', htmlContent);
}

// 6. LOGIKA UTAMA (MAIN)
function init() {
    // Cek LocalStorage: Sudah pernah isi belum?
    if (localStorage.getItem('balmon_age_submitted')) return;

    // Jalankan Injection
    injectStyles();
    injectHTML();

    const overlay = document.getElementById('ageOverlay');
    const btnSubmit = document.getElementById('btnSubmitAge');
    const inputAge = document.getElementById('inputUserAge');

    // Tampilkan Popup setelah 2.5 detik
    setTimeout(() => {
        overlay.classList.add('active');
    }, 2500);

    // Event Klik
    btnSubmit.addEventListener('click', () => {
        const age = inputAge.value;
        if (!age || age < 10 || age > 100) {
            alert("Mohon masukkan usia yang valid (10-100 tahun).");
            return;
        }

        btnSubmit.innerText = "Mengirim...";
        btnSubmit.disabled = true;

        push(ref(db, 'statistik_web/demografi_umur'), {
            umur: parseInt(age),
            kategori: getKategori(age),
            waktu: serverTimestamp(),
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        }).then(() => {
            localStorage.setItem('balmon_age_submitted', 'true');
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 500); // Hapus elemen dari DOM
        }).catch((err) => {
            console.error(err);
            btnSubmit.innerText = "Coba Lagi";
            btnSubmit.disabled = false;
        });
    });
}

function getKategori(age) {
    if (age < 18) return "Remaja (<18)";
    if (age >= 18 && age <= 25) return "Gen Z (18-25)";
    if (age >= 26 && age <= 40) return "Dewasa Muda (26-40)";
    if (age >= 41 && age <= 60) return "Dewasa (41-60)";
    return "Lansia (>60)";
}

// Jalankan saat halaman siap
document.addEventListener("DOMContentLoaded", init);