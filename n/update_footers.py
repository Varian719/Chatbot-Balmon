import os
import glob
import re

new_footer_content = """
                <div class="footer-col">
                    <h3>Balmon Samarinda</h3>
                    <p style="color:rgba(255,255,255,0.7); line-height:1.8;">
                        Jl. Sultan Sulaiman No. 55, Kel. Sambutan, Kec. Sambutan,<br>Samarinda, Kalimantan Timur 75115.<br><br>
                        <strong>Telp:</strong> 0856-4828-3012<br><strong>Email:</strong>
                        pelayananuptbalmonsamarinda@gmail.com
                    </p>
                </div>
                <div class="footer-col">
                    <h3>Tautan Cepat</h3>
                    <div class="footer-links">
                        <a href="profil.html">Profil Organisasi</a><a href="#">Standar Pelayanan</a><a
                            href="#">Pengaduan Masyarakat</a><a href="#">Peta Sebaran Menara</a>
                    </div>
                </div>
                <div class="footer-col">
                    <h3>Jam Pelayanan</h3>
                    <p style="color:rgba(255,255,255,0.7);">Senin - Kamis: 08.00 - 16.00<br>Jumat: 08.00 -
                        16.30<br>Sabtu - Minggu: Libur</p>
                </div>
"""

def extract_and_replace_footer(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return f"Error reading {filepath}: {e}"

    # Find the <div class="footer-grid">...
    start_idx = content.find('<div class="footer-grid')
    if start_idx == -1:
        return "Not found"
    
    # Find the end of opening tag
    start_inner_idx = content.find('>', start_idx) + 1
    
    # We need to find the matching closing </div> for footer-grid
    # Since we know the structure has 3 footer-col divs, we can also just count dives
    div_count = 1
    i = start_inner_idx
    while i < len(content):
        if content.startswith('<div', i):
            div_count += 1
        elif content.startswith('</div', i):
            div_count -= 1
            if div_count == 0:
                break
        i += 1
        
    if div_count == 0:
        end_inner_idx = i
        new_content = content[:start_inner_idx] + new_footer_content + "            " + content[end_inner_idx:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return "Updated"
    else:
        return "Mismatched divs"

html_files = glob.glob('*.html') + glob.glob('DashboardBalmon/*.html')
for file in html_files:
    res = extract_and_replace_footer(file)
    print(f"{file}: {res}")

