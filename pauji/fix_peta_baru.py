import requests
import json
import os

# Nama file tujuan (sesuai yang dipakai di maps.html)
OUTPUT_FILE = "batas_kaltim.geojson"

# Daftar URL Alternatif (Prioritas dari atas ke bawah)
URLS = [
    # Sumber 1: Repo farhanabdmusa (Spesifik Kaltim 6400)
    {
        "url": "https://raw.githubusercontent.com/farhanabdmusa/indonesia-geojson-by-province/master/6400.geojson",
        "sumber": "GitHub (farhanabdmusa)"
    },
    # Sumber 2: Repo bachtiarpanjaitan (Data BPS - Adm2/Kabupaten)
    {
        "url": "https://raw.githubusercontent.com/bachtiarpanjaitan/geojson-id/master/data/adm2/64.json",
        "sumber": "GitHub (bachtiarpanjaitan)"
    },
    # Sumber 3: Super Duper (Kaltim Full)
    {
        "url": "https://super-duper.fr/geojson/indonesia/indonesia_kalimantantimur.geojson",
        "sumber": "Super-Duper.fr"
    }
]

def cek_properti(data_json):
    """Mengecek apakah data memiliki kolom nama kota yang sesuai dengan maps.html"""
    if 'features' not in data_json or not data_json['features']:
        return False, "Format GeoJSON salah (tidak ada features)"
    
    first_prop = data_json['features'][0]['properties']
    keys = first_prop.keys()
    
    # Kolom yang didukung maps.html Anda
    supported_keys = ['WADMKK', 'NAMOBJ', 'NAME_2', 'kabupaten', 'name']
    
    found = [k for k in keys if k in supported_keys]
    
    if found:
        return True, f"Ditemukan kolom nama wilayah: {found}"
    else:
        # Jika tidak ketemu, kita coba intip apa kuncinya
        return False, f"Warning: Tidak ditemukan kolom nama yang cocok. Kolom yang ada: {list(keys)}"

def download_peta():
    print(f"🔍 Memulai pencarian data peta untuk Kalimantan Timur...")
    
    berhasil = False
    
    for item in URLS:
        url = item['url']
        sumber = item['sumber']
        
        print(f"\n👉 Mencoba download dari: {sumber}")
        print(f"🔗 URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print("✅ Koneksi berhasil! Menganalisa data...")
                
                try:
                    data = response.json()
                    is_ok, msg = cek_properti(data)
                    print(f"ℹ️  Status Data: {msg}")
                    
                    # Simpan file
                    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                        json.dump(data, f)
                        
                    print(f"💾 BERHASIL! File disimpan sebagai: {OUTPUT_FILE}")
                    berhasil = True
                    break # Berhenti looping jika sudah berhasil
                    
                except json.JSONDecodeError:
                    print("❌ Gagal: File bukan JSON yang valid.")
            else:
                print(f"❌ Gagal: Server merespon {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error koneksi: {e}")

    if berhasil:
        print("\n🎉 SELESAI. Silakan refresh 'maps.html' di browser Anda.")
    else:
        print("\n⚠️ SEMUA SUMBER GAGAL. Periksa koneksi internet Anda.")

if __name__ == "__main__":
    download_peta()