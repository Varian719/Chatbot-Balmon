import glob
import re

desktop_link = '                            <li><a href="datasertifikat.html">Data Sertifikat</a></li>\n'
mobile_link = '                <a href="datasertifikat.html" onclick="closeMobileMenu()">Data Sertifikat</a>\n'

def fix_duplicates(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(filepath, 'r', encoding='windows-1252') as f:
                content = f.read()
        except Exception:
            return "Read Error"
        
    # Remove consecutive duplicate desktop links
    # Use re.sub to replace 2 or more occurrences with just 1
    new_content = re.sub(
        r'(?:[ \t]*<li><a href="datasertifikat\.html">Data Sertifikat</a></li>\r?\n){2,}',
        '                            <li><a href="datasertifikat.html">Data Sertifikat</a></li>\n',
        content
    )
    
    new_content = re.sub(
        r'(?:[ \t]*<a href="datasertifikat\.html" onclick="closeMobileMenu\(\)">Data Sertifikat</a>\r?\n){2,}',
        '                <a href="datasertifikat.html" onclick="closeMobileMenu()">Data Sertifikat</a>\n',
        new_content
    )

    if new_content != content:
        # Determine encoding to write back
        enc = 'utf-8'
        try:
            content.encode('utf-8')
        except:
            enc = 'windows-1252'
            
        with open(filepath, 'w', encoding=enc) as f:
            f.write(new_content)
        return "Fixed"
    return "No changes"

html_files = glob.glob('*.html') + glob.glob('DashboardBalmon/*.html')
for file in html_files:
    res = fix_duplicates(file)
    print(f"{file}: {res}")
