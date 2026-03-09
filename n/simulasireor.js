// Bank soal REOR (20 soal lengkap)
const soalREOR = [
    {
        soal: "Apa kepanjangan dari REOR?",
        pilihan: [
            "A. Radio Elektronik dan Operator Radio",
            "B. Radio Elektronika dan Operator Radio",
            "C. Radio Elektronik dan Operasi Radio",
            "D. Radio Elektronika dan Operasional Radio"
        ],
        jawaban: 1, // B
        pembahasan: "REOR adalah singkatan dari Radio Elektronika dan Operator Radio, yaitu sertifikasi yang wajib dimiliki oleh operator radio di kapal."
    },
    {
        soal: "Sertifikat REOR wajib dimiliki oleh siapa?",
        pilihan: [
            "A. Semua pengguna radio amatir",
            "B. Operator radio di kapal dan bidang maritim",
            "C. Teknisi elektronik",
            "D. Penyiaran FM"
        ],
        jawaban: 1, // B
        pembahasan: "Sertifikat REOR wajib dimiliki oleh operator radio di kapal sesuai aturan internasional ITU, IMO, dan SOLAS."
    },
    {
        soal: "Apa dasar hukum internasional untuk sertifikasi REOR?",
        pilihan: [
            "A. ITU, IMO, dan SOLAS",
            "B. ISO 9001",
            "C. IEEE 802.11",
            "D. 3GPP"
        ],
        jawaban: 0, // A
        pembahasan: "Dasar hukum internasional untuk REOR adalah ITU (International Telecommunication Union), IMO (International Maritime Organization), dan SOLAS (Safety of Life at Sea)."
    },
    {
        soal: "Berapa lama masa berlaku sertifikat REOR?",
        pilihan: [
            "A. 2 tahun",
            "B. 3 tahun",
            "C. 4 tahun",
            "D. 5 tahun"
        ],
        jawaban: 3, // D
        pembahasan: "Sertifikat REOR berlaku selama 5 tahun dan dapat diperpanjang setelah memenuhi persyaratan yang ditentukan."
    },
    {
        soal: "Dokumen apa yang diperlukan untuk mengajukan ujian REOR?",
        pilihan: [
            "A. KTP dan Pas foto",
            "B. Ijazah terakhir",
            "C. Surat keterangan sehat",
            "D. Semua jawaban benar"
        ],
        jawaban: 3, // D
        pembahasan: "Persyaratan umum untuk ujian REOR meliputi KTP, pas foto terbaru, ijazah terakhir (minimal SMP), dan surat keterangan sehat."
    },
    {
        soal: "Apa yang dimaksud dengan GMDSS?",
        pilihan: [
            "A. Global Maritime Distress and Safety System",
            "B. General Maritime Digital Safety System",
            "C. Global Mobile Data Service System",
            "D. General Mobile Distress and Safety System"
        ],
        jawaban: 0, // A
        pembahasan: "GMDSS (Global Maritime Distress and Safety System) adalah sistem keselamatan maritim global yang wajib dipahami oleh operator radio kapal."
    },
    {
        soal: "Frekuensi internasional untuk sinyal darurat (distress) di laut adalah?",
        pilihan: [
            "A. 2182 kHz",
            "B. 121.5 MHz",
            "C. 156.8 MHz (Channel 16)",
            "D. Semua jawaban benar"
        ],
        jawaban: 3, // D
        pembahasan: "Frekuensi darurat di laut meliputi 2182 kHz (MF), 121.5 MHz (penerbangan), dan 156.8 MHz atau Channel 16 (VHF maritim)."
    },
    {
        soal: "Apa fungsi dari EPIRB?",
        pilihan: [
            "A. Menyiarkan berita cuaca",
            "B. Memancarkan sinyal posisi darurat",
            "C. Berkomunikasi antar kapal",
            "D. Mengirim email"
        ],
        jawaban: 1, // B
        pembahasan: "EPIRB (Emergency Position Indicating Radio Beacon) adalah alat yang memancarkan sinyal darurat yang berisi identitas dan posisi kapal saat terjadi kecelakaan."
    },
    {
        soal: "SINPoF adalah singkatan dari?",
        pilihan: [
            "A. Sistem Informasi Pengawasan Frekuensi",
            "B. Sistem Informasi dan Pengendalian Frekuensi",
            "C. Sistem Informasi dan Pengawasan Frekuensi",
            "D. Sistem Informasi Pos dan Frekuensi"
        ],
        jawaban: 2, // C
        pembahasan: "SINPoF (Sistem Informasi dan Pengawasan Frekuensi) adalah sistem yang digunakan untuk pengawasan penggunaan spektrum frekuensi radio di Indonesia."
    },
    {
        soal: "Apa yang dimaksud dengan BHP ISR?",
        pilihan: [
            "A. Biaya Hak Penggunaan Izin Stasiun Radio",
            "B. Biaya Hak Pengguna Izin Stasiun Radio",
            "C. Biaya Hak Pengusahaan Izin Stasiun Radio",
            "D. Biaya Hak Pakai Izin Stasiun Radio"
        ],
        jawaban: 0, // A
        pembahasan: "BHP ISR (Biaya Hak Penggunaan Izin Stasiun Radio) adalah biaya yang harus dibayarkan untuk penggunaan spektrum frekuensi radio."
    },
    {
        soal: "Berapa lama proses penerbitan ISR melalui layanan ODS?",
        pilihan: [
            "A. 1 hari",
            "B. 3 hari",
            "C. 7 hari",
            "D. 14 hari"
        ],
        jawaban: 0, // A
        pembahasan: "ODS (One Day Service) adalah layanan penerbitan ISR dalam waktu 1 hari untuk pengajuan yang lengkap sebelum jam 11.00 WITA."
    },
    {
        soal: "Apa kepanjangan dari UNAR?",
        pilihan: [
            "A. Ujian Negara Amatir Radio",
            "B. Ujian Nasional Amatir Radio",
            "C. Ujian Negara Amatir Radio",
            "D. Ujian Nasional Amatir Radio"
        ],
        jawaban: 0, // A
        pembahasan: "UNAR (Ujian Negara Amatir Radio) adalah ujian untuk mendapatkan sertifikat operator radio amatir."
    },
    {
        soal: "Berapa kali kesempatan mengulang ujian UNAR jika tidak lulus?",
        pilihan: [
            "A. 1 kali",
            "B. 2 kali",
            "C. 3 kali",
            "D. 4 kali"
        ],
        jawaban: 2, // C
        pembahasan: "Peserta UNAR yang tidak lulus diberikan kesempatan mengulang ujian sebanyak 3 kali."
    },
    {
        soal: "Apa warna latar belakang pas foto untuk pendaftaran UNAR?",
        pilihan: [
            "A. Biru",
            "B. Merah",
            "C. Putih",
            "D. Kuning"
        ],
        jawaban: 1, // B
        pembahasan: "Pas foto untuk pendaftaran UNAR harus dengan latar belakang warna merah."
    },
    {
        soal: "Biaya mengikuti ujian UNAR adalah?",
        pilihan: [
            "A. Rp 50.000",
            "B. Rp 100.000",
            "C. Rp 150.000",
            "D. Gratis"
        ],
        jawaban: 3, // D
        pembahasan: "Ujian Negara Amatir Radio (UNAR) tidak dipungut biaya (GRATIS)."
    },
    {
        soal: "Apa singkatan dari SDPPI?",
        pilihan: [
            "A. Sumber Daya dan Perangkat Pos dan Informatika",
            "B. Sumber Daya dan Perangkat Pos dan Informasi",
            "C. Sistem Daya dan Perangkat Pos dan Informatika",
            "D. Sumber Data dan Perangkat Pos dan Informatika"
        ],
        jawaban: 0, // A
        pembahasan: "SDPPI adalah Direktorat Jenderal Sumber Daya dan Perangkat Pos dan Informatika, induk dari Balmon."
    },
    {
        soal: "Wilayah kerja Balmon Samarinda meliputi?",
        pilihan: [
            "A. Kalimantan Timur",
            "B. Kalimantan Timur dan Kalimantan Utara",
            "C. Kalimantan Timur dan sekitarnya",
            "D. Seluruh Kalimantan"
        ],
        jawaban: 2, // C
        pembahasan: "Balmon Samarinda memiliki wilayah kerja Kalimantan Timur dan sekitarnya."
    },
    {
        soal: "Apa tugas utama Balmon Samarinda?",
        pilihan: [
            "A. Mengawasi penggunaan spektrum frekuensi radio",
            "B. Menerbitkan izin frekuensi radio",
            "C. Melakukan ujian amatir radio",
            "D. Semua jawaban benar"
        ],
        jawaban: 3, // D
        pembahasan: "Tugas utama Balmon meliputi pengawasan frekuensi, penerbitan izin, dan pelayanan ujian amatir radio."
    },
    {
        soal: "Website resmi untuk pengajuan ISR online adalah?",
        pilihan: [
            "A. isr.postel.go.id",
            "B. isr.kominfo.go.id",
            "C. isr.sdppi.go.id",
            "D. isr.balmon.go.id"
        ],
        jawaban: 0, // A
        pembahasan: "Pengajuan ISR dilakukan secara online melalui website isr.postel.go.id."
    },
    {
        soal: "Apa yang harus dilakukan jika lupa password akun ISR?",
        pilihan: [
            "A. Membuat akun baru",
            "B. Mengajukan lupa password di website",
            "C. Menghubungi admin",
            "D. Mengirim email"
        ],
        jawaban: 1, // B
        pembahasan: "Jika lupa password, ajukan lupa password melalui website perizinan. Password baru akan dikirim ke email terdaftar."
    }
];

let currentSoal = 0;
let jawabanUser = new Array(soalREOR.length).fill(null);
let timerInterval;
let waktu = 0;

// Fungsi untuk memuat soal
function loadSoal(index) {
    const soal = soalREOR[index];
    document.getElementById('soal').innerHTML = `<p><strong>${index+1}. ${soal.soal}</strong></p>`;
    
    let htmlPilihan = '';
    soal.pilihan.forEach((p, i) => {
        const checked = jawabanUser[index] === i ? 'checked' : '';
        htmlPilihan += `
            <div class="pilihan">
                <input type="radio" name="jawaban" value="${i}" id="p${i}" ${checked} onchange="simpanJawaban(${index}, ${i})">
                <label for="p${i}">${p}</label>
            </div>
        `;
    });
    document.getElementById('jawaban').innerHTML = htmlPilihan;
    document.getElementById('soalCounter').innerText = `Soal ${index+1}/${soalREOR.length}`;
}

// Fungsi navigasi
function prevSoal() {
    if (currentSoal > 0) {
        currentSoal--;
        loadSoal(currentSoal);
    }
}

function nextSoal() {
    if (currentSoal < soalREOR.length - 1) {
        currentSoal++;
        loadSoal(currentSoal);
    }
}

// Fungsi simpan jawaban
function simpanJawaban(index, nilai) {
    jawabanUser[index] = nilai;
}

// Timer
function startTimer() {
    timerInterval = setInterval(() => {
        waktu++;
        const menit = Math.floor(waktu / 60);
        const detik = waktu % 60;
        document.getElementById('timer').innerText = `Waktu: ${menit.toString().padStart(2,'0')}:${detik.toString().padStart(2,'0')}`;
    }, 1000);
}

// Submit ujian
function submitUjian() {
    clearInterval(timerInterval);
    
    let benar = 0;
    soalREOR.forEach((soal, i) => {
        if (jawabanUser[i] === soal.jawaban) benar++;
    });
    
    const skor = Math.round((benar / soalREOR.length) * 100);
    
    document.getElementById('hasil').style.display = 'block';
    document.getElementById('skor').innerHTML = `Skor Anda: ${skor}% (${benar}/${soalREOR.length} benar)`;
    
    // Tampilkan pembahasan untuk soal yang salah
    let pembahasanHtml = '<h4><i class="bi bi-journal-text"></i> Pembahasan:</h4><ul>';
    let adaSalah = false;
    soalREOR.forEach((soal, i) => {
        if (jawabanUser[i] !== soal.jawaban) {
            adaSalah = true;
            pembahasanHtml += `<li><strong>Soal ${i+1}:</strong> ${soal.pembahasan}</li>`;
        }
    });
    if (!adaSalah) {
        pembahasanHtml += '<li>Selamat! Semua jawaban Anda benar. 🎉</li>';
    }
    pembahasanHtml += '</ul>';
    document.getElementById('pembahasan').innerHTML = pembahasanHtml;
    
    // Sembunyikan form soal
    document.querySelector('.soal-box').style.display = 'none';
    document.querySelector('.jawaban-box').style.display = 'none';
    document.querySelector('.nav-box').style.display = 'none';
    document.querySelector('.submit-box').style.display = 'none';
}

// Ulangi ujian
function ulangiUjian() {
    currentSoal = 0;
    jawabanUser = new Array(soalREOR.length).fill(null);
    waktu = 0;
    
    document.querySelector('.soal-box').style.display = 'block';
    document.querySelector('.jawaban-box').style.display = 'block';
    document.querySelector('.nav-box').style.display = 'flex';
    document.querySelector('.submit-box').style.display = 'block';
    document.getElementById('hasil').style.display = 'none';
    
    loadSoal(0);
    startTimer();
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    loadSoal(0);
    startTimer();
});