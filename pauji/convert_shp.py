import os
import shutil
import geopandas as gpd
import py7zr

# --- KONFIGURASI ---
INPUT_FILE = 'Provinsi SHP.7z'
OUTPUT_FILE = 'batas_kaltim.geojson'

def proses_peta():
    # 1. GABUNGKAN FILE (.001 + .002 -> .7z)
    if not os.path.exists(INPUT_FILE):
        print(f"Sedang menggabungkan {INPUT_FILE}...")
        with open(INPUT_FILE, 'wb') as outfile:
            part = 1
            while True:
                part_name = f"{INPUT_FILE}.{part:03d}"
                if not os.path.exists(part_name): break
                with open(part_name, 'rb') as infile:
                    shutil.copyfileobj(infile, outfile)
                part += 1
    
    # 2. EKSTRAK 7Z
    print("Mengekstrak file SHP...")
    with py7zr.SevenZipFile(INPUT_FILE, mode='r') as z:
        z.extractall(path="temp_shp")

    # 3. CARI FILE .SHP
    shp_path = None
    for root, dirs, files in os.walk("temp_shp"):
        for file in files:
            if file.endswith(".shp"):
                shp_path = os.path.join(root, file)
                break
    
    # 4. FILTER KALIMANTAN TIMUR & SIMPAN GEOJSON
    print("Membaca dan memfilter peta...")
    gdf = gpd.read_file(shp_path)
    
    # Filter Provinsi (Sesuaikan nama kolom jika beda, misal 'WADMPR')
    col_name = 'WADMPR' if 'WADMPR' in gdf.columns else 'PROVINSI'
    gdf_kaltim = gdf[gdf[col_name].str.contains("KALIMANTAN TIMUR", case=False, na=False)]
    
    # Sederhanakan agar ringan di web (Simplify)
    gdf_kaltim = gdf_kaltim.simplify(tolerance=0.001, preserve_topology=True)
    
    # Simpan
    gdf_kaltim.to_file(OUTPUT_FILE, driver='GeoJSON')
    print(f"✅ SUKSES! File '{OUTPUT_FILE}' berhasil dibuat.")

    # Hapus file sementara
    shutil.rmtree("temp_shp")

if __name__ == "__main__":
    try:
        proses_peta()
    except Exception as e:
        print(f"Error: {e}")
        print("Pastikan Anda sudah install library: pip install geopandas py7zr")