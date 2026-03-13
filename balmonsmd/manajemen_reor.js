// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
  authDomain: "admin-pelayanan-balmon.firebaseapp.com",
  projectId: "admin-pelayanan-balmon",
  storageBucket: "admin-pelayanan-balmon.firebasestorage.app",
  messagingSenderId: "1071557110255",
  appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elemen UI
const userDisplay = document.getElementById('user-display');
const btnLogout = document.getElementById('btnLogout');

// Cek status autentikasi
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    userDisplay.textContent = user.email;
    initApp();
  }
});

// Logout
btnLogout.addEventListener('click', async () => {
  const result = await Swal.fire({
    title: 'Keluar?',
    text: "Anda akan keluar dari sesi ini.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Keluar'
  });
  if (result.isConfirmed) {
    await signOut(auth);
    sessionStorage.removeItem('googleSheetToken'); 
    window.location.href = "index.html";
  }
});

// =====================================================
// APLIKASI CRUD dengan GOOGLE SHEETS API RESMI
// =====================================================

const SPREADSHEET_ID = '1mNz4Kzz-pi3vRAyoQxnm8pVYO3uPqpyshx_DlPDcdgc'; 

// --- PERUBAHAN: DAFTAR GID DITULIS MANUAL ---
// WAJIB GANTI ANGKA DI BAWAH INI DENGAN GID ASLI DARI URL GOOGLE SHEET ANDA!
// Contoh URL: https://docs.google.com/spreadsheets/d/1mNz.../edit#gid=0 -> maka GID-nya 0
let SHEET_GIDS = {
  "2025": 592977247,         // Ganti dengan GID sheet 2025
  "2026": 1445083747, // Ganti dengan GID sheet 2026
  "2027": 123005415, // Ganti dengan GID sheet 2027
  "2028": 1927547785, // Ganti dengan GID sheet 2028
  "2029": 1354748064, // Ganti dengan GID sheet 2029
  "2030": 1567790831, // Ganti dengan GID sheet 2030
  "2031": 1438376619, // Ganti dengan GID sheet 2031
  "2032": 1222971136, // Ganti dengan GID sheet 2032
  "2033": 1111357989, // Ganti dengan GID sheet 2033
  "2034": 1304395900, // Ganti dengan GID sheet 2034
  "2035": 393023817  // Ganti dengan GID sheet 2035
}; 

let sheetHeadersMap = {}; 
let currentAction = 'create';
let headers = []; 
let allData = [];
const modal = new bootstrap.Modal(document.getElementById('modalREOR'));

const dateFields = [
  'Tanggal Lahir', 'Tanggal Terbit', 'Masa Berlaku',
  'Tanggal Permohonan', 'Tanggal Pembayaran', 'Tanggal Pengambilan'
];

// Pastikan ejaan nama di dalam array ini SAMA PERSIS dengan judul kolom di Excel
const requiredFields = [
  'Nama Pemilik', 'Client ID', 'No Sertifikat', 
  'Status Permohonan', 'Status'
];

function handleFetchError(error, context) {
  console.error(`Error di ${context}:`, error);
  Swal.fire('Error', `Terjadi kesalahan: ${error.message}`, 'error');
}

// ================== INISIALISASI & DETEKSI SHEET ==================
async function initApp() {
  const token = sessionStorage.getItem('googleSheetToken');
  if (!token) {
    Swal.fire('Error', 'Token tidak ditemukan, silakan login ulang.', 'error');
    return;
  }
  
  // Karena GID sudah ditulis manual di atas, kita langsung memuat data (bypass deteksi awal)
  await loadData();
}

// ================== HELPER PANGGILAN SHEETS API ==================
async function callGoogleSheetsAPI(options = {}) {
  const { action = 'read', params = {}, body = null } = options;
  const token = sessionStorage.getItem('googleSheetToken');
  
  if (!token) throw new Error("Sesi berakhir. Pastikan Anda login menggunakan tombol 'Login Akun Google Dinas'.");

  const baseHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const safeRange = encodeURIComponent(`'${params.sheet}'!A:Z`);

  try {
    let res;
    if (action === 'read') {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${safeRange}?t=${new Date().getTime()}`;
      res = await fetch(url, { method: 'GET', headers: baseHeaders });
    } else if (action === 'create') {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${safeRange}:append?valueInputOption=USER_ENTERED`;
      res = await fetch(url, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({ values: [body.rowValues] })
      });
    } else if (action === 'update') {
      const updateRange = encodeURIComponent(`'${params.sheet}'!A${body.rowNumber}`); 
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${updateRange}?valueInputOption=USER_ENTERED`;
      res = await fetch(url, {
        method: 'PUT',
        headers: baseHeaders,
        body: JSON.stringify({ values: [body.rowValues] })
      });
    } else if (action === 'delete') {
      const sheetId = SHEET_GIDS[params.sheet];
      if (sheetId === undefined) throw new Error(`GID untuk sheet ${params.sheet} belum terdeteksi sistem.`);
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`;
      const deleteRequest = {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: body.rowNumber - 1, 
              endIndex: body.rowNumber
            }
          }
        }]
      };
      res = await fetch(url, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify(deleteRequest)
      });
    }

    if (!res.ok) {
      if (res.status === 401) {
        sessionStorage.removeItem('googleSheetToken');
        Swal.fire('Sesi Berakhir', 'Silakan login ulang.', 'error');
        window.location.href = "index.html";
        throw new Error('Unauthorized');
      }
      throw new Error(await res.text());
    }
    return await res.json();
  } catch (err) {
    throw new Error(err.message || 'Gagal menghubungi Google Sheets API');
  }
}

// ================== READ SEMUA DATA ==================
async function loadData() {
  const tbody = document.getElementById('reorTableBody');
  if(tbody) tbody.innerHTML = '<tr><td colspan="18" class="text-center">Memuat & menggabungkan data dari semua Sheet...</td></tr>';
  
  const sheets = Object.keys(SHEET_GIDS);
  if (sheets.length === 0) return;

  try {
    const promises = sheets.map(sheet => callGoogleSheetsAPI({ action: 'read', params: { sheet } }));
    const results = await Promise.allSettled(promises);

    allData = [];
    sheetHeadersMap = {};
    let isHeadersSet = false;

    results.forEach((result, index) => {
      const sheetName = sheets[index];
      
      if (result.status === 'fulfilled') {
        const data = result.value;
        
        if (data.values && data.values.length > 0) {
          const cleanHeaders = data.values[0].map(h => h ? h.toString().trim() : '');
          sheetHeadersMap[sheetName] = cleanHeaders;

          if (data.values.length > 1) {
            if (!isHeadersSet) {
              headers = cleanHeaders.filter(key => key !== 'rowNumber' && key.toLowerCase() !== 'no' && key !== '');
              isHeadersSet = true;
            }

            const rows = data.values.slice(1).map((row, rowIndex) => {
              let obj = { rowNumber: rowIndex + 2, sheetName: sheetName }; 
              cleanHeaders.forEach((h, i) => {
                if(h) obj[h] = row[i] || '';
              });
              return obj;
            });

            const validRows = rows.filter(r => Object.keys(r).some(k => k !== 'rowNumber' && k !== 'sheetName' && r[k] !== ''));
            allData = allData.concat(validRows);
          }
        } else {
          sheetHeadersMap[sheetName] = []; 
        }
      } else {
        console.warn(`Sheet ${sheetName} belum dibuat atau kosong, dilewati.`);
        sheetHeadersMap[sheetName] = []; 
      }
    });

    if (allData.length === 0) {
      const headerTampil = headers.length > 0 ? headers : ['Data Kosong'];
      renderTableHeader([...headerTampil]); // Perubahan: Dihapus 'Tahun (Sheet)'
      if(tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center text-muted">Belum ada data di semua sheet.</td></tr>';
      updateStats([]);
      return;
    }

    renderTableHeader([...headers]); // Perubahan: Dihapus 'Tahun (Sheet)'
    renderTableBody(allData);
    updateStats(allData);

  } catch (err) {
    handleFetchError(err, 'loadData');
    if(tbody) tbody.innerHTML = '<tr><td colspan="100%" class="text-center text-danger">Gagal memuat data.</td></tr>';
  }
}

function renderTableBody(data) {
  const tbody = document.getElementById('reorTableBody');
  if(!tbody) return;
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="100%" class="text-center text-muted">Tidak ada data yang sesuai.</td></tr>';
    return;
  }
  let html = '';
  data.forEach((item, index) => {
    const status = item['Status'] || '';
    const isCompleted = status === 'Sudah Diambil' || status === 'Sudah Diselesaikan' || status === 'Sudah diambil dan sudah diselesaikan';
    const rowClass = isCompleted ? 'table-success' : '';
    html += '<tr class="' + rowClass + '">';
    
    html += '<td>' + (index + 1) + '</td>';
    // Perubahan: Baris HTML untuk kolom 'Tahun (Sheet)' telah dihapus
    
    headers.forEach(h => {
      let value = item[h] || '';
      if (dateFields.includes(h) && value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let [y, m, d] = value.split('-');
        value = `${d}-${m}-${y}`;
      }
      html += '<td>' + escapeHtml(value) + '</td>';
    });
    
    html += '<td>';
    const identifier = item.rowNumber;
    const sName = item.sheetName;
    html += `<button class="btn btn-sm btn-warning btn-action" onclick="editData('${sName}', ${identifier})" title="Edit"><i class="bi bi-pencil"></i></button>`;
    html += `<button class="btn btn-sm btn-danger btn-action" onclick="deleteData('${sName}', ${identifier})" title="Hapus"><i class="bi bi-trash"></i></button>`;
    html += '</td></tr>';
  });
  tbody.innerHTML = html;
}

function renderTableHeader(headersList) {
  const thead = document.getElementById('tableHeader');
  if(!thead) return;
  let html = '<tr><th>No</th>';
  headersList.forEach(h => html += '<th>' + escapeHtml(h) + '</th>');
  html += '<th>Aksi</th></tr>';
  thead.innerHTML = html;
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[&<>"]/g, m => {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    return m;
  });
}

function updateStats(data) {
  const elCetak = document.getElementById('count-status-permohonan-cetak');
  const elSelesai = document.getElementById('count-status-pengambilan-selesai');

  if(elCetak) {
    const countCetak = data.filter(item => item['Status Permohonan'] === 'Telah Dicetak').length;
    elCetak.textContent = countCetak;
  }

  if(elSelesai) {
    const countSelesai = data.filter(item => {
      const status = item['Status'];
      return status === 'Sudah Diambil' || status === 'Sudah Diselesaikan' || status === 'Sudah diambil dan sudah diselesaikan';
    }).length;
    elSelesai.textContent = countSelesai;
  }
}

// ================== SEARCH & FILTER ==================
window.filterData = function() {
  const searchInput = document.getElementById('searchInput');
  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtered = allData;

  // Filter berdasarkan Teks Pencarian
  if (searchText) {
    filtered = filtered.filter(item =>
      item.sheetName.toLowerCase().includes(searchText) ||
      headers.some(h => (item[h] || '').toString().toLowerCase().includes(searchText))
    );
  }
  
  renderTableBody(filtered);
};

// ================== MODAL & FORM ==================
window.openCreateModal = function() {
  if (headers.length === 0) {
    Swal.fire('Info', 'Belum ada struktur data. Pastikan Sheet Anda memiliki Judul Kolom (Header).', 'info');
    return;
  }
  currentAction = 'create';
  document.getElementById('modalREORLabel').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Tambah Data';
  document.getElementById('reorForm').reset();
  document.getElementById('rowId').value = '';
  generateFormFields();
  modal.show();
};

// Form Fields dinamis
function generateFormFields(item = null) {
  const container = document.getElementById('formFields');
  let html = '';
  
  let sheetOptions = Object.keys(SHEET_GIDS).map(s => 
    `<option value="${s}" ${item && item.sheetName === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  html += `<div class="col-md-12 mb-3">
    <label for="_sheetTarget" class="form-label fw-bold text-primary">Data Disimpan di Sheet (Tahun):</label>
    <select class="form-select border-primary" id="_sheetTarget" name="_sheetTarget" required ${item ? 'disabled' : ''}>
      ${sheetOptions}
    </select>
    ${item ? '<small class="text-muted">Tahun sheet tidak dapat diubah pada mode Edit.</small>' : ''}
  </div>`;

  headers.forEach(h => {
    const value = item ? (item[h] || '') : '';
    let inputType = 'text';
    let inputValue = value;
    if (dateFields.includes(h)) {
      inputType = 'date';
      if (value && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
        let [d, m, y] = value.split('-');
        inputValue = `${y}-${m}-${d}`;
      }
    }
    const requiredAttr = requiredFields.includes(h) ? 'required' : '';
    html += `<div class="col-md-6 mb-3">
      <label for="${h}" class="form-label">${escapeHtml(h)} ${requiredAttr ? '<span class="text-danger">*</span>' : ''}</label>
      <input type="${inputType}" class="form-control" id="${h}" name="${h}" value="${escapeHtml(inputValue)}" ${requiredAttr}>
    </div>`;
  });
  container.innerHTML = html;
}

window.editData = function(sheetName, identifier) {
  if (headers.length === 0) {
    Swal.fire('Info', 'Struktur data belum tersedia.', 'info');
    return;
  }
  currentAction = 'update';
  document.getElementById('modalREORLabel').innerHTML = '<i class="bi bi-pencil-square me-2"></i>Edit Data';
  
  const item = allData.find(d => d.rowNumber == identifier && d.sheetName === sheetName);
  if (item) {
    document.getElementById('rowId').value = identifier;
    generateFormFields(item);
    modal.show();
  } else {
    Swal.fire('Error', 'Data tidak ditemukan di memori.', 'error');
  }
};

// ================== SAVE (CREATE/UPDATE) ==================
window.saveData = function() {
  const form = document.getElementById('reorForm');
  const formData = new FormData(form);
  const identifier = document.getElementById('rowId').value; 
  const targetSheet = document.getElementById('_sheetTarget').value;

  // Validasi manual field yang required
  for (let [key, value] of formData.entries()) {
    if (key !== '_sheetTarget' && requiredFields.includes(key) && !value.trim()) {
      Swal.fire('Peringatan', `Field "${key}" wajib diisi!`, 'warning');
      return;
    }
  }

  let dataObj = {};
  for (let [key, value] of formData.entries()) {
    if(key !== '_sheetTarget') {
      dataObj[key] = value;
    }
  }

  let targetHeaders = sheetHeadersMap[targetSheet];
  if (!targetHeaders || targetHeaders.length === 0) {
    targetHeaders = ['No', ...headers];
  }

  const rowValues = targetHeaders.map(h => {
    if (h.toLowerCase() === 'no') return ''; 
    return dataObj[h] || '';
  });

  Swal.fire({
    title: 'Menyimpan...',
    text: 'Harap tunggu',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  if (currentAction === 'create') {
    callGoogleSheetsAPI({
      action: 'create',
      params: { sheet: targetSheet },
      body: { rowValues }
    })
      .then(result => {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil ditambahkan', timer: 1500, showConfirmButton: false });
        modal.hide();
        loadData();
      })
      .catch(err => {
        Swal.close();
        handleFetchError(err, 'saveData (Create)');
      });
  } else {
    callGoogleSheetsAPI({
      action: 'update',
      params: { sheet: targetSheet },
      body: { rowNumber: parseInt(identifier), rowValues }
    })
      .then(result => {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil diupdate', timer: 1500, showConfirmButton: false });
        modal.hide();
        loadData();
      })
      .catch(err => {
        Swal.close();
        handleFetchError(err, 'saveData (Update)');
      });
  }
};

// ================== DELETE ==================
window.deleteData = function(sheetName, identifier) {
  Swal.fire({
    title: `Hapus Data dari Tahun ${sheetName}?`,
    text: 'Data yang dihapus tidak dapat dikembalikan!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, Hapus'
  }).then(confirm => {
    if (!confirm.isConfirmed) return;

    Swal.fire({
      title: 'Menghapus...',
      text: 'Harap tunggu',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    
    callGoogleSheetsAPI({
      action: 'delete',
      params: { sheet: sheetName },
      body: { rowNumber: identifier } 
    })
      .then(result => {
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Data berhasil dihapus', timer: 1500, showConfirmButton: false });
        loadData();
      })
      .catch(err => {
        Swal.close();
        handleFetchError(err, 'deleteData');
      });
  });
};

window.refreshSheets = function() {
  initApp();
};