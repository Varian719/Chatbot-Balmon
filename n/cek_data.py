import os
import shutil
import geopandas as gpd
import py7zr

# --- NAMA FILE ---
INPUT_FILE = 'Provinsi SHP.7z'

def cek_isi_shp():
    print("=== MULAI PENGECEKAN ===")
    
    # 1. Cek apakah file part ada
    if not os.path.exists(f"{INPUT_FILE}.001"):
        print(f"❌ ERROR: File '{INPUT_FILE}.001' tidak ditemukan!")
        return

    # 2. Gabungkan File (Jika belum ada file .7z gabungan)
    if not os.path.exists(INPUT_FILE):
        print("pk Menggabungkan file .001 dan .002...")
        try:
            with open(INPUT_FILE, 'wb') as outfile:
                part = 1
                while True:
                    part_name = f"{INPUT_FILE}.{part:03d}"
                    if not os.path.exists(part_name): break
                    with open(part_name, 'rb') as infile:
                        shutil.copyfileobj(infile, outfile)
                    part += 1
            print("✅ Penggabungan selesai.")
        except Exception as e:
            print(f"❌ Gagal menggabungkan file: {e}")
            return

    # 3. Ekstrak
    print("📂 Mengekstrak file...")
    temp_dir = "temp_cek_data"
    try:
        with py7zr.SevenZipFile(INPUT_FILE, mode='r') as z:
            z.extractall(path=temp_dir)
    except Exception as e:
        print(f"❌ Gagal ekstrak 7z (Mungkin library py7zr bermasalah): {e}")
        return

    # 4. Cari Shapefile
    shp_path = None
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            if file.endswith(".shp"):
                shp_path = os.path.join(root, file)
                print(f"📄 Ditemukan Shapefile: {file}")
                break
    
    if not shp_path:
        print("❌ Tidak ada file .shp di dalam arsip ini!")
        return

    # 5. BACA DATA & PRINT KOLOM
    print("\n=== INFORMASI DATA ===")
    try:
        gdf = gpd.read_file(shp_path)
        print(f"Jumlah Baris Data: {len(gdf)}")
        print("\nDAFTAR NAMA KOLOM:")
        print(gdf.columns.tolist())
        
        print("\nCONTOH 5 DATA PERTAMA (Untuk melihat cara penulisan 'Kalimantan Timur'):")
        # Kita coba print kolom yang mungkin berisi nama provinsi
        kolom_mungkin = [c for c in gdf.columns if 'WAD' in c or 'NAM' in c or 'PROV' in c]
        if kolom_mungkin:
            print(gdf[kolom_mungkin].head())
        else:
            print(gdf.head())
            
    except Exception as e:
        print(f"❌ Gagal membaca Shapefile dengan Geopandas: {e}")

    # Bersihkan
    # shutil.rmtree(temp_dir) 

if __name__ == "__main__":
    cek_isi_shp()