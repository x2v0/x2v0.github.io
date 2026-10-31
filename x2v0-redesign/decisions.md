# Decisions

## From the conversation (Artem)

| # | Question | Decision |
|---|---|---|
| 1 | What is the site for? | Both: job hunting (systems / DevOps / C++) and academic credibility. |
| 2 | Language | Russian and English, switchable on the page. |
| 3 | Delivery | A link that can be shared with Valeriy on the internet, plus this archive with sources, prompts, studies and decisions. |
| 4 | Missing facts | Research them (see `research/facts.md`). |

## Content

- **One source of truth.** The home page and resume.md had drifted apart. The new site is one page: it is the resume. The PDF is printed from the same page.
- **Engineering first, science as proof.** Order: hero → experience (full, 1987–2025) → skills → selected projects → science and publications → education. The physics career stays complete, but publications sit after the engineering work, so a recruiter sees the engineering first and an academic still finds h-index, papers and the full ORCID list.
- **Projects live under the job they came from.** The separate "Проекты" block (one item) is gone. DICOM viewer, AlignPatient, EBTfilm, TM go under PROTOM; lfspd and SpdCMake under JINR; GUI Builder, TASImage, Carrot, QtRoot, RDBC under CERN; mtapi and ROOT.NET under "Personal projects" in the Skills section.
- **The vacancy table** ("Требование вакансии | Мой опыт") is no longer a table, but nothing in it was dropped: CI/CD pipelines, the CMake infrastructure and the x86_64/e2k/aarch64 builds moved into the JINR entry.
- **Metrics name their source** (Scopus or ORCID). One set of numbers everywhere.
- **Rule for claims (Artem):** "unsupported ok, wrong no. explain me before we throw away stuff." Claims without a public source stay as written. Only claims a source contradicts were changed, each one explained and approved first (see below).
- **Copy stays in Valeriy's own words**, lightly edited. No marketing taglines. Where research added a fact, it is written plainly and the source is in `research/facts.md`.
- **Phone number left off the web page.** It was in resume.md; a new public URL would spread it further. Easy to add back if wanted.
- **Contact = email shown as text with a Copy button**, plus GitHub, ORCID, Scopus. The broken form is gone (it never sent anything).

## Design

- Direction: a scientific-paper feel for an engineer who has spent his career in physics institutes. Cool off-white paper, graphite ink, one cobalt accent. Moved away from the cream + green look of the old site.
- Type: **Spectral** for the name and headings (book/paper serif, full Cyrillic), **IBM Plex Sans** for body, **IBM Plex Mono** only for dates, tech names and numbers. All three have Cyrillic.
- Career axis 1987 → 2025 drawn as one horizontal bar: physics / CERN / medicine / JINR / ELVEES, to scale. It shows 38 years at a glance and is drawn from the real dates.
- No emoji in headings, no scroll-reveal animation, no cards everywhere. Rules and spacing do the separation.
- Portrait: cropped and converted to black and white so the cluttered background recedes. A proper photo would still be better.
- Light and dark themes, following the system with a manual toggle.

## Functionality

- RU / EN switch: both languages live side by side in the same HTML (`data-l="ru"` / `data-l="en"`), so editing one sentence means the translation is right next to it. The choice is remembered and can be set by link (`#en`).
- Publications: all 78 ORCID works are embedded as data (no API call at runtime), with search and DOI links.
- Print stylesheet: Ctrl+P / Save as PDF gives a clean A4 resume. Ready-made PDFs (RU and EN) are in `pdf/`.
- Removed: fake page switching with iframes, broken form, `test.js`, runtime markdown rendering, marked.js.
- Plain static HTML + CSS + a little JS, no build step, so it can be dropped into the x2v0.github.io repo as is.

## Hosting

- **Live draft on Cloudflare** (Artem, 30 Oct 2026): https://x2v0-resume.onuchinart.workers.dev, with the notes at /notes/ and this archive at /archive/. Deployed as a Workers static site (Cloudflare now routes new Pages projects to Workers). Search engines are told not to index it (robots.txt + X-Robots-Tag) until Valeriy approves.

- Shared now as a private claude.ai artifact link (Artem shares it with Valeriy).
- To go live: copy `site/` into the x2v0.github.io repository (replacing index.html, style.css, script.js). The old `portfolio/` and `year-archive/` folders can stay; the new page does not link to them yet (open question: keep Portfolio and Blog?).

## Research corrections (approved by Artem, 30 Oct 2026)

1. lfspd: "200+ packages" → "170+", as in the lfspd README.
2. ROOT paper: cited as 2009 (CPC 180, 2499) as the main paper; the 2011 item is shown under it as the separate 2-page v5.28 update.
3. CERN dates: kept as 2004–2008 until Valeriy confirms (sources point to about 2002–2005 at CERN, with remote work to 2009).
4. "Windows version of ROOT" → "Windows GUI and graphics port of ROOT (TGWin32)", as in ROOT's credits.

Added from research (all sourced in `research/facts.md`): Prometheus / Radiance 330 sites and "more than 1,000 patients by 2021"; signals and slots (TQObject); TGHtml; about 520 ROOT commits 2000–2009; SPD TDR co-authorship; the Hyperon-M DAQ paper; ROOT.NET; mkimage-profiles-skif.

## Positioning (Artem, 30 Oct 2026)

- Target: software engineering roles at research institutions. Passive search, so the page does **not** say he is looking for a job.
- Hero line instead: almost 40 years across research institutes and industry; knows what physicists need from software and how to build it so it runs for years. This is a draft line; better in Valeriy's own words.
- Job titles chosen for an engineering profile: ELVEES "Инженер-программист", JINR "Системный программист", Protom "Ведущий разработчик медицинского ПО", CERN "Программист" (he was not a physicist there), IHEP "Научный сотрудник, физик-экспериментатор" (his own resume wording, unchanged).
- Email: valeriy.onuchin@yandex.ru (marked preferred in resume.md). Metrics: the Scopus numbers from his current site.

## Second design (Artem, 30 Oct 2026)

Artem: "the design doesn't look good … the diagram seems to be unnecessary … research best practices for resume … choose nice humanist-sans font … it needs to look stylish."

- Checked the published page in Chrome: it renders the same as locally, so the artifact host was not the cause. The first design was too spread out with weak hierarchy.
- Research: `study/resume-practices.md`.
- **Career bar removed.** Charts and timelines are invisible to ATS parsers and add little for a person.
- **Layout:** sticky profile column on the left (photo, name, title, summary, section nav with the current section marked, email, links, RU/EN, theme, PDF); the record scrolls on the right. One column on phones and in print.
- **Type:** Fira Sans only (humanist sans, full Cyrillic), weights 300–700. Alternatives considered: PT Sans (made for Russian, a little dated), Source Sans 3 (more neutral).
- **Colour:** near-white and ink with one petrol accent for section labels, links, bullets and tech tags; matching dark theme.
- **About block** at the top of the record with three facts: ROOT co-author, 12 years of proton therapy software (1,000+ patients), h-index 43.
- **Each job reads "Role · Organisation"**, so the title leads.
- **One self-contained HTML file** (`site/index.html`): portrait and publication list are inlined, so it opens from disk, by email or on GitHub Pages with nothing else. Edit `site/src.html` and run `python3 tools/build.py`.
- First design kept in `drafts/v1/`.
