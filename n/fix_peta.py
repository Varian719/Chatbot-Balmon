import requests
import json
import os

# URL RESMI Highcharts Map Collection - Kalimantan Timur (Kabupaten/Kota)
# Status Link: AKTIF & STABIL
URL_FIX = "https://raw.githubusercontent.com/highcharts/map-collection-dist/master/countries/id/id-ki-all.geo.json"
NAMA_FILE = "batas_kaltim.geojson"

def ambil_peta_final():
    print("🔄 Menghubungkan ke server Highcharts...")
    print(f"🔗 URL: {URL_FIX}")
    
    try:
        # Gunakan verify=False jika ada masalah sertifikat SSL di komputer lokal
        response = requests.get(URL_FIX, verify=True)
        
        if response.status_code == 200:
            print("✅ Data diterima!")
            
            # Simpan data
            with open(NAMA_FILE, 'wb') as f:
                f.write(response.content)
                
            print(f"💾 Berhasil disimpan: {NAMA_FILE}")
            print(f"📂 Lokasi: {os.getcwd()}")
            
            # Cek isi sedikit untuk memastikan bukan file kosong
            size = os.path.getsize(NAMA_FILE)
            print(f"📊 Ukuran file: {size / 1024:.2f} KB")
            
        else:
            print(f"❌ Gagal. Server merespon: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error Sistem: {e}")

if __name__ == "__main__":
    ambil_peta_final()