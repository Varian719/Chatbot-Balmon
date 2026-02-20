/* * FILE: assets/js/admin-security.js
 * FUNGSI: Menangani Auth, Security Gate, dan Firebase Init untuk semua halaman Admin.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// --- 1. KONFIGURASI FIREBASE ---
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
const auth = getAuth(app);
const db = getDatabase(app); // Diekspor agar bisa dipakai file lain
const provider = new GoogleAuthProvider();

// --- 2. INJECT CSS & HTML GATE SECARA OTOMATIS ---
const injectSecurityUI = () => {
    // A. Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #security-gate {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(15px);
            z-index: 999999; display: flex; flex-direction: column;
            justify-content: center; align-items: center; transition: opacity 0.4s ease-out;
        }
        .gate-content {
            background: white; padding: 40px; border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center;
            max-width: 400px; width: 90%; border: 1px solid #e0e0e0;
        }
        .spinner-encryption {
            width: 50px; height: 50px; border: 5px solid #f3f3f3;
            border-top: 5px solid #3b82f6; border-radius: 50%;
            animation: spin 1s linear infinite; margin: 0 auto 20px auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        /* Blur konten utama saat terkunci */
        body:not(.authenticated) .app-wrapper { filter: blur(8px); pointer-events: none; }
        body.authenticated .app-wrapper { filter: none; pointer-events: auto; transition: filter 0.3s; }
    `;
    document.head.appendChild(style);

    // B. Inject HTML Gate
    const gateDiv = document.createElement('div');
    gateDiv.id = 'security-gate';
    gateDiv.innerHTML = `
        <div class="gate-content">
            <img src="https://cdn-icons-png.flaticon.com/512/900/900782.png" width="60" class="mb-3" alt="Logo">
            <h4 class="fw-bold mb-1">Admin Balmon</h4>
            <p class="text-muted small mb-4">Akses Terenkripsi Diperlukan</p>
            
            <div id="loader-state">
                <div class="spinner-encryption"></div>
                <p class="text-secondary fw-semibold">Verifikasi Token...</p>
            </div>

            <div id="login-state" style="display: none;">
                <p class="text-danger small mb-3"><i class="bi bi-shield-lock-fill"></i> Silakan login untuk melanjutkan</p>
                <button id="btn-g-login" class="btn btn-dark w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20">
                    Masuk dengan Google
                </button>
            </div>
        </div>
        <div class="mt-4 text-muted small"><i class="bi bi-lock-fill"></i> Secure Admin Access</div>
    `;
    document.body.appendChild(gateDiv);

    // Bind Event Listener Login di sini (agar tidak perlu fungsi global window)
    document.getElementById('btn-g-login').addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then((result) => console.log("Logged in:", result.user.email))
            .catch((error) => alert("Login Error: " + error.message));
    });
};

// --- 3. FUNGSI UTAMA (INIT) ---
// Fungsi ini dipanggil oleh setiap halaman. Menerima 'callback' untuk memuat data khusus halaman tsb.
export function initAdminPage(onDataLoad) {
    injectSecurityUI(); // Pasang UI Keamanan

    const gate = document.getElementById('security-gate');
    const loaderState = document.getElementById('loader-state');
    const loginState = document.getElementById('login-state');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // --- USER LOGIN SUKSES ---
            console.log("Auth Module: User Verified");
            
            // 1. Update UI Header/Sidebar (Jika elemen ada)
            const els = {
                email: document.getElementById('user-email-display'),
                name: document.getElementById('user-name-display'),
                imgHead: document.getElementById('header-user-img'),
                imgDrop: document.getElementById('dropdown-user-img')
            };
            
            if(els.email) els.email.innerText = user.email.split('@')[0];
            if(els.name) els.name.innerText = user.displayName || "Admin";
            if(user.photoURL) {
                if(els.imgHead) els.imgHead.src = user.photoURL;
                if(els.imgDrop) els.imgDrop.src = user.photoURL;
            }

            // 2. Buka Gerbang
            gate.style.opacity = '0';
            setTimeout(() => { 
                gate.style.display = 'none'; 
                document.body.classList.add('authenticated');
            }, 500);

            // 3. JALANKAN CALLBACK (Load Data Spesifik Halaman)
            if (onDataLoad && typeof onDataLoad === 'function') {
                onDataLoad(user, db); // Kirim objek user dan database ke halaman
            }

        } else {
            // --- USER BELUM LOGIN ---
            document.body.classList.remove('authenticated');
            gate.style.display = 'flex';
            gate.style.opacity = '1';
            
            setTimeout(() => {
                loaderState.style.display = 'none';
                loginState.style.display = 'block';
            }, 800);
        }
    });
}

// --- 4. EXPORT FUNGSI LOGOUT GLOBAL ---
window.logout = function() {
    if(confirm("Keluar dari sistem admin?")) {
        signOut(auth).then(() => location.reload());
    }
};