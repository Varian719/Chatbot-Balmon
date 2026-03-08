import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
    authDomain: "admin-pelayanan-balmon.firebaseapp.com",
    databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
    projectId: "admin-pelayanan-balmon",
    appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

// Inisialisasi Firebase dengan penanganan error
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    // Jika sudah ada, buat instance dengan nama unik
    app = initializeApp(firebaseConfig, 'komentarApp');
}
const db = getDatabase(app);
const komentarRef = ref(db, 'komentar');

function loadComments() {
    onValue(komentarRef, (snapshot) => {
        const commentsList = document.getElementById('commentsList');
        if (!snapshot.exists()) {
            commentsList.innerHTML = '<div class="empty-comments">Belum ada komentar. Jadilah yang pertama!</div>';
            return;
        }

        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });

        comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        let html = '';
        comments.forEach(comment => {
            const date = comment.timestamp ? new Date(comment.timestamp) : new Date();
            const formattedDate = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-name">${escapeHTML(comment.name)}</span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <p class="comment-message">${escapeHTML(comment.message)}</p>
                </div>
            `;
        });

        commentsList.innerHTML = html;
    }, (error) => {
        console.error('Error loading comments:', error);
    });
}

window.submitComment = function() {
    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    const messageInput = document.getElementById('commentMessage');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name) {
        alert('Nama harus diisi.');
        return;
    }
    if (!message) {
        alert('Komentar harus diisi.');
        return;
    }
    if (email && !validateEmail(email)) {
        alert('Format email tidak valid.');
        return;
    }

    const newCommentRef = push(komentarRef);
    const commentData = {
        name: name,
        email: email || '',
        message: message,
        timestamp: serverTimestamp()
    };

    newCommentRef.set(commentData)
        .then(() => {
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';
        })
        .catch((error) => {
            console.error('Gagal menyimpan komentar:', error);
            alert('Terjadi kesalahan: ' + error.message);
        });
};

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function escapeHTML(str) {
    return str.replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

document.addEventListener('DOMContentLoaded', loadComments);