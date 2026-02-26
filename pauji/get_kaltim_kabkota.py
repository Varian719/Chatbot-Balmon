import requests
import json
import os

# URL Data GeoJSON Publik (Per Kabupaten/Kota - Kode Kaltim: 64)
# Sumber: Repositori Peta Indonesia (Fadli)
URL_GEOJSON = "https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/master/provinsi/64_kalimantan_timur.geojson"
OUTPUT_FILE = "batas_kaltim_kabkota.geojson"

def download_peta():
    print(f"Sedang mendownload data Kabupaten/Kota Kaltim...")
    try:
        response = requests.get(URL_GEOJSON)
        response.raise_for_status() # Cek error koneksi
        
        data = response.json()
        
        # Cek apakah data valid
        jumlah_wilayah = len(data['features'])
        print(f"✅ Berhasil! Ditemukan {jumlah_wilayah} Kabupaten/Kota di Kaltim.")
        
        # Simpan ke file
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(data, f)
            
        print(f"📁 File disimpan sebagai: {OUTPUT_FILE}")
        print("Gunakan file ini di HTML Anda.")
        
    except Exception as e:
        print(f"❌ Gagal download: {e}")

if __name__ == "__main__":
    download_peta()