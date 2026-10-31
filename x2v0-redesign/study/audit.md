# Audit of x2v0.github.io (30 Oct 2026)

Screenshots: `x2v0-desktop.jpeg` (1440px, full page), `x2v0-mobile.jpeg` (390px, first screen).
Original files: `../original/`.

## Bugs that make the site look unfinished

- **The name never appears as a headline.** `h1`, `.profile-name` and `.profile-role` are all `display:none` (override blocks near the end of `style.css`, lines ~1237–1300). The page opens on a small grey subtitle.
- **Section headers are broken.** CSS defines `.section-head`, `.section-title`, `.section-caption`; HTML uses `class="section reveal-head"`, `section reveal-title`, `section reveal-caption`. Looks like a find-and-replace of `section-` → `section reveal-`. Result: each heading becomes title + rule + caption on its own line ("ИНСТРУМЕНТАРИЙ И ЭКСПЕРТИЗА") + another rule.
- **Contact form sends nothing.** No `action`, no submit handler. A visitor's message is lost silently.
- `style.css` is 65 KB with 655 `!important` — patch on patch. Inline styles with `#0288d1` blue clash with the green palette; dark mode forces every h1–h3 to `#4fc3f7`.
- `test.js` (console checks, calls ORCID API on every visit) runs in production.
- `favicon.ico` returns 404; GoatCounter request returns 400 (visits probably not counted).
- Resume / Portfolio / Blog are shown by hiding `<main>` and injecting divs/iframes: no URLs, Back button leaves the site, nothing can be linked.
- Resume markdown is fetched and rendered in the browser with marked.js on click.

## Content

Two sources of truth (index.html and resume.md) that disagree:

| | index.html | resume.md |
|---|---|---|
| Citations / papers | 15,108 / 78 (Scopus) | "более 14 800" / 84 |
| Email | valeriy.onuchin@ya.ru | valeriy.onuchin@yandex.ru |
| JINR role | Системный программист | Программист-физик |
| PROTOM role | Ведущий разработчик медицинского ПО | Инженер-программист |
| ELVEES dates | 2025 – 12/2025 | март – декабрь 2025 |
| Career span | "2004 — 2025" | 1987 – 2025 (IHEP missing on home) |

Other content issues:
- Hero subtitle repeated word for word under "Квалификация".
- ROOT paper listed twice (2009 and 2011 entries).
- "Go" appears only in the skill tags.
- resume.md has a "Требование вакансии | Мой опыт" table — a cover letter for one vacancy inside a general resume.
- Russian and English headings mixed ("Scopus Metrics", "Key Publications", "Portfolio", "SELECTED WORK").
- 12 years at PROTOM = one line on the home page. The real work (DICOM viewer, AlignPatient, EBTfilm, TM protocol) is only in resume.md; "Проекты" shows only mtapi.
- Typos: "editting", "линий кода" (→ строк кода).
- Photo is a webcam frame in a cluttered room; topbar avatar is a different image.

## What is good and worth keeping

- The material itself: physicist → ROOT co-author at CERN → 12 years of proton therapy software → Linux distro builds → OS for Elbrus/aarch64.
- Left profile column on desktop.
- Full publication list from ORCID with search.
- Dark mode.
