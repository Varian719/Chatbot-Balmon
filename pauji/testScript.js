        // Render FAQ
        (function () {
            const faqData = [
                {
                    question: "Dimanakah pengajuan izin frekuensi radio dilakukan?",
                    answer: "Pengajuan izin frekuensi radio dilakukan secara online melalui website <a href='https://isr.postel.go.id' target='_blank' style='color:#006fb0;'>isr.postel.go.id</a> setelah akun terdaftar."
                },
                {
                    question: "Bagaimanakah persyaratan atau tata cara mengurus izin frekuensi radio?",
                    answer: `<p>Ada 2 tahap:</p>
                <ol>
                    <li><strong>Pembuatan Akun</strong>
                        <ul>
                            <li><strong>Instansi Pemerintah:</strong> Surat Keterangan Berdirinya Instansi, NPWP Instansi, Surat Kuasa (jika dikuasakan), KTP Pemberi dan Penerima Kuasa, form my spectra yang sudah ditandatangani dan distempel.</li>
                            <li><strong>Pelaku Usaha/Badan Hukum:</strong> NIB RBA yang sudah memiliki PBUMKU ISR, NPWP Perusahaan, Akta Perusahaan, Surat Kuasa (jika dikuasakan), KTP Direktur/Penerima Kuasa, form my spectra yang ditandatangani dan distempel.</li>
                        </ul>
                    </li>
                    <li><strong>Pengajuan Teknis Perizinan:</strong>
                        <ul>
                            <li>Surat Permohonan dan Sanggup Bayar</li>
                            <li>Diagram Konfigurasi Jaringan (apabila menggunakan repeater dan/rig)</li>
                            <li>IPP yang masih berlaku (untuk izin penyiaran)</li>
                        </ul>
                    </li>
                </ol>
                <p>Semua file dalam format PDF.</p>`
                },
                {
                    question: "Bagaimanakah cara mengetahui status pengajuan akun saya?",
                    answer: "Status pengajuan akun dapat dicek secara berkala melalui email yang didaftarkan pada sistem."
                },
                {
                    question: "Bagaimanakah jika pengajuan akun saya ditolak?",
                    answer: "Ajukan kembali dengan memperhatikan alasan penolakan (kelengkapan dokumen, salah pengisian data)."
                },
                {
                    question: "Apa langkah selanjutnya setelah pengajuan akun saya diterima?",
                    answer: "Lanjutkan dengan login pada website perizinan untuk mengajukan ISR dengan mengisi data teknis dan melengkapi dokumen pengajuan teknis perizinan."
                },
                {
                    question: "Apakah setelah akun disetujui saya bisa mengubah data akun?",
                    answer: "Bisa. Ajukan perubahan data akun/modifikasi data administrasi melalui website perizinan dengan login, kemudian klik profile dan klik ubah data user."
                },
                {
                    question: "Apakah syarat untuk merubah data administrasi?",
                    answer: "Untuk merubah data administrasi cukup dengan melampirkan dokumen seperti ketika mengajukan akun ditambah Surat Permohonan Modifikasi Akun/Pemutakhiran Data."
                },
                {
                    question: "Bagaimanakah cara agar NIB dapat terkoneksi dengan HUB KOMINFO?",
                    answer: `<p>Langkah agar NIB terhubung ke HUB KOMINFO:</p>
                <ol>
                    <li>Login ke <a href='https://oss.go.id' target='_blank'>oss.go.id</a></li>
                    <li>Klik “PB-UMKU”</li>
                    <li>Klik “Proses Perizinan Berusaha UMKU” pada KBLI yang sudah ada</li>
                    <li>Klik “Ajukan Perizinan Berusahan UMKU”</li>
                    <li>Klik “Ya” untuk Apakah Anda memerlukan Perizinan Berusaha UMKU Lainnya?</li>
                    <li>Search “Izin Stasiun Radio”, lalu dipilih</li>
                    <li>Klik “Proses Perizinan Berusaha UMKU”</li>
                </ol>`
                },
                {
                    question: "Bagaimana jika saya lupa password?",
                    answer: "Ajukan Lupa Password melalui website perizinan. Password terbaru akan dikirimkan ke email yang didaftarkan di sistem."
                },
                {
                    question: "Bagaimanakah cara pengajuan ISR?",
                    answer: `<p>Cara pengajuan ISR:</p>
                <ol>
                    <li>Login ke website perizinan <a href='https://isr.postel.go.id' target='_blank'>isr.postel.go.id</a></li>
                    <li>Klik menu aplikasi baru pilih layanan/service (untuk penggunaan HT pilih Seluler Darat Pribadi Standar Seluler ke Seluler, untuk penggunaan Rig/Repeater pilih Seluler Darat Pribadi Standar)</li>
                    <li>Isikan data teknis seperti koordinat dan alamat stasiun, merk dan seri perangkat serta jumlah perangkat</li>
                    <li>Lampirkan Surat Permohonan dan Sanggup Bayar yang ditandatangani oleh Direktur yang namanya tertera di AKTA untuk Badan Hukum, Kepala Instansi untuk Instansi Pemerintah atau yang namanya disebut di Surat Kuasa jika dikuasakan</li>
                    <li>Lampirkan Diagram Konfigurasi Jaringan untuk pengajuan dengan Rig/Repeater</li>
                    <li>Format surat dan lampiran dokumen dapat dilihat pada tautan <a href='https://s.komdigi.go.id/dokumenperizinanyogyakarta' target='_blank'>https://s.komdigi.go.id/dokumenperizinanyogyakarta</a> (contoh dari Balmon Jogja, untuk Samarinda dapat menyesuaikan)</li>
                </ol>`
                },
                {
                    question: "Bagaimanakah cara mengisi data teknis untuk pengajuan ISR?",
                    answer: `<p>Beberapa hal yang harus diperhatikan:</p>
                <ul>
                    <li>Pilih kanal frekuensi VHF (136 – 174 MHz) atau UHF (350 – 380 MHz)</li>
                    <li>Isian Radius Operasi (m) untuk stasiun Repeater (40000), Base (25000), MU (10000) & HT (5000)</li>
                    <li>Isian ketinggian di atas tanah untuk stasiun Repeater (minimal 10), Base (minimal 10), MU & HT (2)</li>
                    <li>Isian Feeding Loss untuk stasiun Repeater/Base adalah (1) dan MU dan HT (0)</li>
                    <li>Isian Antenna untuk stasiun Repeater,Base,dan MU (DEFAULT VHF/UHF3 DB OMNI), untuk perangkat HT (DEFAULT VHF/UHF 0 DB OMNI)</li>
                    <li>Isian Keluaran Daya Operasi (Power) untuk Repeater(40), Base & MU (25), HT (5)</li>
                    <li>Isian Nama Stasiun untuk Stasiun perangkat Handy Talky MASTER yaitu HT. 01 BERGERAK SEKITAR (ALAMAT / NAMA JALAN), dan untuk perangkat Handy Talky PENGIKUT /Mobiles yaitu HT. 02 – (Jumlah stasiun yang diajukan) BERGERAK SEKITAR (ALAMAT / NAMA JALAN) (WAJIB HURUF BESAR)</li>
                </ul>`
                },
                {
                    question: "Berapa lamakah pengajuan ISR itu?",
                    answer: "Pengajuan ISR disetujui melalui 2 sistem yaitu ODS (One Day Service) dan SDS (Same Day Service) untuk pengajuan sebelum jam 11.00 WITA."
                },
                {
                    question: "Bagaimanakah cara mengetahui status pengajuan ISR saya?",
                    answer: "Status pengajuan ISR dapat dicek secara berkala melalui website perizinan di menu Ikhtisar Perizinan (Lacak Aplikasi) dan email yang didaftarkan pada sistem."
                },
                {
                    question: "Apa sajakah yang membuat pengajuan ISR saya ditolak?",
                    answer: "Pengajuan ISR ditolak karena kurang lengkapnya dokumen, salah pengisian data, dan kanal frekuensi yang diajukan sudah penuh."
                },
                {
                    question: "Bagaimanakah jika pengajuan ISR saya ditolak?",
                    answer: "Ajukan kembali dengan memperhatikan alasan penolakan."
                },
                {
                    question: "Apa langkah selanjutnya setelah pengajuan ISR saya diterima?",
                    answer: "Unduh invoice BHP frekuensi radio dengan login ke <a href='https://billing-isr.kominfo.go.id' target='_blank'>billing-isr.kominfo.go.id</a> lalu lakukan pembayaran secara host to host melalui Bank Mandiri, BRI, BNI, BSI."
                },
                {
                    question: "Kapan ISR saya terbit?",
                    answer: "Setelah dilakukan pembayaran, download ISR melalui website perizinan atau billing ISR."
                },
                {
                    question: "Apakah saya bisa merubah data ISR?",
                    answer: "Bisa. Ajukan perubahan data teknis melalui website perizinan dengan login kemudian klik Aplikasi Modifikasi Lisensi serta dilengkapi dengan Surat Permohonan Modifikasi."
                },
                {
                    question: "Apakah jika saya mengajukan ISR sudah pasti disetujui?",
                    answer: "Tidak. Pengajuan ISR dapat ditolak karena selain kurangnya kelengkapan data teknis juga karena terbatasnya ketersediaan kanal frekuensi di wilayah yang akan diajukan."
                },
                {
                    question: "Bagaimanakah syarat untuk mengikuti ujian?",
                    answer: `<p>Persyaratan untuk mengikuti Ujian Negara Amatir Radio (UNAR):</p>
                <ol>
                    <li>Registrasi akun e-Licensing pada website <a href='https://iar-ikrap.postel.go.id' target='_blank'>iar-ikrap.postel.go.id</a></li>
                    <li>Pas foto terbaru dengan latar belakang warna merah</li>
                    <li>Foto atau scan KTP</li>
                    <li>Surat rekomendasi organisasi yang ditandatangani oleh salah satu dari pengurus organisasi daerah khusus untuk peserta UNAR kenaikan tingkat</li>
                    <li>Surat pernyataan tidak keberatan dari orang tua/wali atau keterangan kepala sekolah bagi yang belum berusia 17 Tahun</li>
                </ol>`
                },
                {
                    question: "Berapakah biaya ujian?",
                    answer: "GRATIS"
                },
                {
                    question: "Apakah kartu ujian perlu dicetak dan bagaimana caranya?",
                    answer: "Kartu ujian dicetak oleh panitia ujian."
                },
                {
                    question: "Bagaimanakah kalau saya tidak lulus ujian?",
                    answer: "Dapat mengulang ujian sebanyak 3 kali."
                },
                {
                    question: "Setelah lulus ujian apa yang harus saya lakukan?",
                    answer: "Mendaftar ke Organisasi setempat untuk mendapatkan Kartu Tanda Anggota (KTA)."
                }
            ];

            const faqList = document.getElementById('faqList');
            if (faqList) {
                faqData.slice(0, 8).forEach((item, index) => { // Tampilkan 8 FAQ teratas
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item compact';

                    const questionBtn = document.createElement('button');
                    questionBtn.className = 'faq-question';
                    questionBtn.setAttribute('aria-expanded', 'false');
                    questionBtn.innerHTML = `${item.question} <i class="bi bi-chevron-down"></i>`;

                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'faq-answer';
                    answerDiv.innerHTML = `<p>${item.answer}</p>`;

                    questionBtn.addEventListener('click', function () {
                        document.querySelectorAll('.faq-question').forEach(q => {
                            if (q !== this) {
                                q.classList.remove('active');
                                q.nextElementSibling.classList.remove('show');
                                q.setAttribute('aria-expanded', 'false');
                            }
                        });
                        this.classList.toggle('active');
                        answerDiv.classList.toggle('show');
                        this.setAttribute('aria-expanded', this.classList.contains('active'));
                    });

                    faqItem.appendChild(questionBtn);
                    faqItem.appendChild(answerDiv);
                    faqList.appendChild(faqItem);
                });
            }
        })();

