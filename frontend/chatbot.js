/**
 * Chatbot Logic - Sobat Digi
 * Balmon Samarinda
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById("toggleBtn");
    const chatBox = document.getElementById("chatBox");
    const chatFrame = document.getElementById("chatFrame");

    // Fungsi Utama Toggle Chat
    window.animateChatToggle = function() {
        // Lazy Load Iframe: Hanya memuat saat tombol diklik pertama kali
        if (!chatFrame.getAttribute('src')) {
            const source = chatFrame.getAttribute('data-src');
            chatFrame.setAttribute('src', source);
        }

        // Jika sedang aktif, tutup
        if (toggleBtn.classList.contains("active")) {
            toggleBtn.classList.remove("active");
            chatBox.classList.remove("active");
            return;
        }

        // Animasi loading singkat sebelum membuka
        if (toggleBtn.classList.contains("loading")) return;
        
        toggleBtn.classList.add("loading");
        setTimeout(() => {
            toggleBtn.classList.remove("loading");
            toggleBtn.classList.add("active");
            chatBox.classList.add("active");
        }, 400);
    };

    // Deteksi Scroll untuk merubah warna tombol saat sampai di footer
    window.addEventListener('scroll', () => {
        const footer = document.getElementById('mainFooter');
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Jika posisi footer sudah masuk ke layar
            if (footerRect.top < windowHeight) {
                toggleBtn.classList.add('on-footer');
            } else {
                toggleBtn.classList.remove('on-footer');
            }
        }
    }, { passive: true });
});