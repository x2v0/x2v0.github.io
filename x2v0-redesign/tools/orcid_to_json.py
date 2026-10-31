"""Turn an ORCID works export into the compact list the site reads.

Usage:
  curl -s -H 'Accept: application/json' \
    https://pub.orcid.org/v3.0/0009-0000-3022-3529/works -o orcid_works.json
  python3 tools/orcid_to_json.py orcid_works.json site/data/publications.json
"""
import json
import sys

src, dst = sys.argv[1], sys.argv[2]
works = []
for group in json.load(open(src, encoding="utf-8"))["group"]:
    w = group["work-summary"][0]
    date = w.get("publication-date") or {}
    year = (date.get("year") or {}).get("value", "")
    doi = ""
    for ext in (w.get("external-ids") or {}).get("external-id", []):
        if ext["external-id-type"] == "doi":
            doi = ext["external-id-value"]
    journal = (w.get("journal-title") or {}).get("value", "")
    works.append({"y": year, "t": w["title"]["title"]["value"], "j": journal, "doi": doi})

works.sort(key=lambda p: p["y"], reverse=True)
json.dump(works, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(works)} works -> {dst}")
