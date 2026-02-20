
        // --- 1. GLOBAL UI LOGIC ---
        function initScrollAnimations() {
            const fadeSections = document.querySelectorAll('.fade-in-section');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('is-visible');
                });
            }, { threshold: 0.1 });
            fadeSections.forEach(section => observer.observe(section));
        }
        document.addEventListener('DOMContentLoaded', initScrollAnimations);

        window.addEventListener('load', () => {
            const loader = document.getElementById('pageLoader');
            if(loader) loader.classList.add('hidden');
            setTimeout(() => {
                document.querySelectorAll('.fade-in-section').forEach(section => section.classList.add('is-visible'));
            }, 100);
        });
        
        window.addEventListener('pageshow', (event) => {
            const loader = document.getElementById('pageLoader');
            if (event.persisted && loader) loader.classList.add('hidden');
        });

        // Handle Link Click Transition
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = this.getAttribute('target');
                if (href && !href.startsWith('#') && !href.startsWith('javascript') && target !== '_blank') {
                    e.preventDefault();
                    const loader = document.getElementById('pageLoader');
                    loader.classList.remove('hidden');
                    setTimeout(() => { window.location.href = href; }, 300);
                }
            });
        });

        // HEADER SCROLL
        let lastScrollY = window.scrollY;
        let ticking = false;
        function updateScroll() {
            const scrollY = window.scrollY;
            const header = document.getElementById('mainHeader');
            const chatBtn = document.getElementById('toggleBtn');
            const footer = document.getElementById('mainFooter');

            if (scrollY > 50) header.classList.add('header-minimal');
            else header.classList.remove('header-minimal');

            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight) chatBtn.classList.add('on-footer');
                else chatBtn.classList.remove('on-footer');
            }
            ticking = false;
        }
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        }, { passive: true });

        // MOBILE MENU
        function toggleMobileMenu() {
            document.getElementById('hamburgerBtn').classList.toggle('active');
            document.getElementById('mobileNavDropdown').classList.toggle('active');
        }
        function closeMobileMenu() {
            document.getElementById('hamburgerBtn').classList.remove('active');
            document.getElementById('mobileNavDropdown').classList.remove('active');
            document.querySelectorAll('.mobile-submenu').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.mobile-menu-item.has-submenu').forEach(i => i.classList.remove('active'));
        }
        function toggleMobileSubmenu(element) {
            const submenu = element.nextElementSibling;
            element.classList.toggle('active');
            if (submenu && submenu.classList.contains('mobile-submenu')) submenu.classList.toggle('active');
        }
        function handleMobileMenuItem(element, action) {
            if (action === 'beranda') window.location.href = 'index.html';
            else if (action === 'kontak') window.location.href = 'kontak.html';
            else if (action === 'publikasi') window.location.href = 'galeri.html';
            else if (action === 'download') window.location.href = 'arsip.html';
            closeMobileMenu();
        }
        document.addEventListener('click', function(event) {
            const header = document.getElementById('mainHeader');
            const nav = document.getElementById('mobileNavDropdown');
            if (!header.contains(event.target) && nav.classList.contains('active')) closeMobileMenu();
        });

        // CHAT TOGGLE (LAZY LOAD LOGIC)
        function animateChatToggle() {
            const btn = document.getElementById("toggleBtn");
            const box = document.getElementById("chatBox");
            const iframe = document.getElementById("chatFrame");

            // Lazy Load Iframe
            if (!iframe.getAttribute('src')) {
                iframe.setAttribute('src', iframe.getAttribute('data-src'));
            }

            if (btn.classList.contains("active")) {
                btn.classList.remove("active"); 
                box.classList.remove("active"); 
                return;
            }
            btn.classList.add("active"); 
            box.classList.add("active");
        }

        // --- 2. SEARCH LOGIC ---
        const pages = [
            { title: "Beranda", url: "index.html", desc: "Halaman utama Balmon Samarinda" },
            { title: "Izin Konsesi", url: "konsesi.html", desc: "Layanan perizinan frekuensi untuk perusahaan/konsesi." },
            { title: "Izin Maritim (Kapal)", url: "maritim.html", desc: "Pengurusan izin stasiun radio kapal dan laut." },
            { title: "Izin Penyiaran FM", url: "fm.html", desc: "Prosedur perizinan untuk stasiun radio FM/Penyiaran." },
            { title: "Galeri Kegiatan", url: "galeri.html", desc: "Dokumentasi foto dan video kegiatan Balmon." },
            { title: "Arsip & Regulasi", url: "arsip.html", desc: "Download dokumen, SOP, dan regulasi terbaru." },
            { title: "Kontak Kami", url: "kontak.html", desc: "Alamat kantor, email, dan nomor pengaduan." }
        ];

        function openSearch() {
            document.getElementById('searchOverlay').classList.add('active');
            setTimeout(() => document.getElementById('searchInput').focus(), 300);
        }
        function closeSearch() {
            document.getElementById('searchOverlay').classList.remove('active');
            document.getElementById('searchInput').value = '';
            document.getElementById('searchResults').innerHTML = '';
        }
        function performSearch() {
            const input = document.getElementById('searchInput').value.toLowerCase();
            const resultContainer = document.getElementById('searchResults');
            resultContainer.innerHTML = '';
            if (input.length < 2) return;
            
            const results = pages.filter(page => page.title.toLowerCase().includes(input) || page.desc.toLowerCase().includes(input));
            
            if (results.length > 0) {
                results.forEach(page => {
                    const item = document.createElement('a');
                    item.href = page.url;
                    item.className = 'search-item';
                    item.innerHTML = `<h4>${page.title}</h4><p>${page.desc}</p>`;
                    resultContainer.appendChild(item);
                });
            } else {
                resultContainer.innerHTML = '<div style="text-align:center; color:#888;">Tidak ditemukan hasil yang cocok.</div>';
            }
        }
        document.addEventListener('keydown', (e) => { if(e.key === "Escape") closeSearch(); });

        // --- 3. GALLERY & LIGHTBOX LOGIC ---
        window.filterGallery = function(category, btnElement) {
            document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
            if(btnElement) btnElement.classList.add('active');

            const items = document.querySelectorAll('.gallery-item');
            items.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.classList.remove('hidden');
                    item.style.animation = 'none';
                    item.offsetHeight; 
                    item.style.animation = 'fadeIn 0.6s ease';
                } else {
                    item.classList.add('hidden');
                }
            });
        };

        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightboxImg');
        const lbVid = document.getElementById('lightboxVideo');
        const lbCap = document.getElementById('lightboxCaption');

        function getEmbedUrl(url) {
            if (!url) return "";
            let videoId = "";
            if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
            else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
            else if (url.includes("embed/")) return url;
            if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            return url;
        }

        window.openLightbox = function(element, type) {
            const parentItem = element.closest('.gallery-item');
            const title = parentItem.querySelector('.item-title').innerText;
            lbCap.innerText = title;
            lightbox.classList.add('active');

            if (type === 'image') {
                const imgTag = element.querySelector('img');
                lbImg.src = imgTag.src;
                lbImg.style.display = 'block';
                lbVid.style.display = 'none';
                lbVid.src = "";
            } else if (type === 'video') {
                const rawVideoUrl = parentItem.dataset.videoSrc;
                const embedUrl = getEmbedUrl(rawVideoUrl);
                lbVid.src = embedUrl;
                lbVid.style.display = 'block';
                lbImg.style.display = 'none';
            }
        };

        window.closeLightbox = function(e) {
            if (e.target.id === 'lightbox' || e.target.classList.contains('close-lightbox')) {
                lightbox.classList.remove('active');
                lbVid.src = ""; 
            }
        };