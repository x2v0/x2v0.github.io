"""Build the site from site/src.html.

Writes:
  site/index.html      one self-contained page (portrait and publication list inlined),
                       ready for GitHub Pages or to open straight from disk
  artifact/index.html  the claude.ai review copy (the host adds its own <html>/<head>/<body>)

Edit text in site/src.html, then run:  python3 tools/build.py
"""
import base64
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / "site/src.html").read_text(encoding="utf-8")

portrait = base64.b64encode((root / "site/images/portrait.jpg").read_bytes()).decode()
pubs = json.loads((root / "site/data/publications.json").read_text(encoding="utf-8"))
pubs_json = json.dumps(pubs, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

page = src.replace("{{PORTRAIT}}", "data:image/jpeg;base64," + portrait).replace("{{PUBS}}", pubs_json)
(root / "site/index.html").write_text(page, encoding="utf-8")

head = re.search(r"<head>(.*?)</head>", page, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", page, re.S).group(1)
head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', "", head)
head = re.sub(r"<title>.*?</title>", "<title>Valeriy Onuchin Resume</title>", head)
(root / "artifact").mkdir(exist_ok=True)
(root / "artifact/index.html").write_text(head.strip() + "\n" + body, encoding="utf-8")

print("site/index.html", len(page) // 1024, "KB; artifact/index.html written")
