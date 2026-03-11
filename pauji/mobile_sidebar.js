// ===== MOBILE SIDEBAR FUNCTIONS =====
(function() {
    // Cek apakah kita di halaman news_detail.html
    if (window.location.pathname.includes('news_detail.html')) {
        // Jika di news_detail, tidak perlu menjalankan sidebar
        return;
    }

    // Toggle menu
    window.toggleMobileMenu = function() {
        const btn = document.getElementById('hamburgerBtn');
        const menu = document.getElementById('mobileNavDropdown');
        const overlay = document.getElementById('mobileNavOverlay');
        
        if (!btn || !menu || !overlay) return;
        
        btn.classList.toggle('active');
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (menu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    window.closeMobileMenu = function() {
        const btn = document.getElementById('hamburgerBtn');
        const menu = document.getElementById('mobileNavDropdown');
        const overlay = document.getElementById('mobileNavOverlay');
        
        if (!btn || !menu || !overlay) return;
        
        btn.classList.remove('active');
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        document.querySelectorAll('.mobile-submenu').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.mobile-menu-item.has-submenu').forEach(i => i.classList.remove('active'));
    };

    // Tutup menu saat overlay diklik
    document.addEventListener('click', function(event) {
        const overlay = document.getElementById('mobileNavOverlay');
        const menu = document.getElementById('mobileNavDropdown');
        if (overlay && overlay.classList.contains('active') && event.target === overlay) {
            window.closeMobileMenu();
        }
    });

    // Toggle submenu
    window.toggleMobileSubmenu = function(element) {
        const submenu = element.nextElementSibling;
        element.classList.toggle('active');
        if (submenu && submenu.classList.contains('mobile-submenu')) {
            submenu.classList.toggle('active');
        }
    };

    // Handle menu item click
    window.handleMobileMenuItem = function(element, action) {
        if (action === 'beranda') window.location.href = 'index.html';
        else if (action === 'kontak') window.location.href = 'kontak.html';
        else if (action === 'publikasi') window.location.href = 'galeri.html';
        else if (action === 'download') window.location.href = 'arsip.html';
        else if (action === 'profil') window.location.href = 'profil.html';
        window.closeMobileMenu();
    };
})();