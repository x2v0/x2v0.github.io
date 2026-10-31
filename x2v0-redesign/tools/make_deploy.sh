#!/bin/sh
# Assemble deploy/ for Cloudflare, then:  npx wrangler@4 deploy   (config: wrangler.jsonc)
set -e
cd "$(dirname "$0")/.."
python3 -I tools/build.py
rm -rf deploy && mkdir -p deploy/notes/docs deploy/notes/shots deploy/archive
cp site/index.html deploy/index.html
cp pdf/Valeriy_Onuchin_CV_ru.pdf pdf/Valeriy_Onuchin_CV_en.pdf deploy/
# Draft: keep it out of search engines until Valeriy approves it.
printf 'User-agent: *\nDisallow: /\n' > deploy/robots.txt
printf '/*\n  X-Robots-Tag: noindex, nofollow\n' > deploy/_headers
# Notes page: the artifact version has no document skeleton, so add one.
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n'
  sed -e 's#https://claude.ai/artifact/PjUJET7iTeS3RLy8B9NNHs#/#' \
      -e 's#target="_blank" rel="noopener">the review link</a>.</p>#>the review link</a>.</p>\
    <p class="intro" style="margin-top:0.75rem">Download: <a href="/archive/x2v0-redesign-archive.zip">full archive (.zip)</a> · <a href="/Valeriy_Onuchin_CV_ru.pdf">PDF, Russian</a> · <a href="/Valeriy_Onuchin_CV_en.pdf">PDF, English</a></p>#' notes/index.html
  printf '\n</body>\n</html>\n'; } > deploy/notes/index.html
cp decisions.md questions-for-valeriy.md prompts.md README.md study/audit.md study/resume-practices.md research/facts.md deploy/notes/docs/
cp study/x2v0-desktop.jpeg study/x2v0-mobile.jpeg study/draft-1-desktop-ru.jpeg study/v2-desktop-en-full.jpeg study/v2-mobile-en.jpeg deploy/notes/shots/
(cd .. && rm -f x2v0-redesign-archive.zip && zip -qr x2v0-redesign-archive.zip x2v0-redesign -x '*.DS_Store' -x 'x2v0-redesign/deploy/*')
cp ../x2v0-redesign-archive.zip deploy/archive/
echo "deploy/ ready:"; find deploy -type f | sort
