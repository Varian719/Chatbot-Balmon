import requests
import json
import os

# URL Peta Indonesia Lengkap (Sumber Stabil)
# Kita pakai data yang mencakup seluruh kabupaten di Indonesia
URL_SUMBER = "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-provinsi-kabupaten.json"
NAMA_OUTPUT = "batas_kaltim.geojson"

# Daftar nama variasi untuk Kalimantan Timur (untuk pencocokan data)
TARGET_PROVINSI = ["KALIMANTAN TIMUR", "KALTIM", "EAST KALIMANTAN"]

def proses_peta():
    print("🚀 Memulai proses download data peta Indonesia...")
    print(f"🔗 Sumber: {URL_SUMBER}")
    
    try:
        # 1. Download File Besar (Peta se-Indonesia)
        response = requests.get(URL_SUMBER)
        if response.status_code != 200:
            print("❌ Gagal mendownload data utama. Cek koneksi internet.")
            return

        print("✅ Data utama berhasil didownload!")
        print("🔍 Sedang memfilter khusus wilayah Kalimantan Timur...")
        
        data_indonesia = response.json()
        features_kaltim = []
        
        # 2. Filter Data
        # Kita cek setiap kabupaten, apakah dia milik Kaltim?
        for feature in data_indonesia['features']:
            props = feature['properties']
            
            # Cek properti 'NAME_1' (Provinsi) atau 'propinsi'
            provinsi_data = props.get('NAME_1', '') or props.get('propinsi', '') or props.get('PROVINSI', '')
            
            if provinsi_data.upper() in TARGET_PROVINSI:
                features_kaltim.append(feature)

        # 3. Cek Hasil Filter
        jumlah = len(features_kaltim)
        if jumlah == 0:
            print("⚠️ Aneh, tidak ditemukan data Kalimantan Timur. Struktur data mungkin berubah.")
            # Opsi cadangan: Coba cari berdasarkan kode provinsi (64) jika ada
        else:
            print(f"🎉 Ditemukan {jumlah} wilayah Kabupaten/Kota di Kalimantan Timur!")

        # 4. Simpan ke GeoJSON Baru
        geojson_baru = {
            "type": "FeatureCollection",
            "features": features_kaltim
        }
        
        with open(NAMA_OUTPUT, 'w') as f:
            json.dump(geojson_baru, f)
            
        print(f"\n✅ SUKSES! File tersimpan: {os.path.abspath(NAMA_OUTPUT)}")
        print("Sekarang file ini SIAP dipakai di HTML Anda.")

    except Exception as e:
        print(f"❌ Terjadi kesalahan: {e}")

if __name__ == "__main__":
    proses_peta()