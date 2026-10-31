# x2v0.github.io redesign

**Start here:** `questions-for-valeriy.md` (what needs his answer), then `decisions.md` (what was decided and why).

Redesign of Valeriy Onuchin's resume site, October 2026. Done by Artem with Claude.

- **Live draft (Cloudflare):** https://x2v0-resume.onuchinart.workers.dev — notes: https://x2v0-resume.onuchinart.workers.dev/notes/ — this archive: https://x2v0-resume.onuchinart.workers.dev/archive/x2v0-redesign-archive.zip
- Review copies on claude.ai (private, shared from their Share menu): site https://claude.ai/artifact/PjUJET7iTeS3RLy8B9NNHs, notes https://claude.ai/artifact/5k8uP7JuBA4nDraMynDECg
- Current live site: https://x2v0.github.io/

## What is here

| Path | What |
|---|---|
| `site/index.html` | The new site: one self-contained HTML file. Copy it into the x2v0.github.io repo as `index.html` to go live, or just open it. |
| `site/src.html` | The editable source of that page. |
| `drafts/v1/` | The first design, kept for reference. |
| `study/resume-practices.md` | Research on resume design practice, with sources. |
| `pdf/` | Ready-made A4 resumes, Russian and English (3 pages each), printed from the site. |
| `decisions.md` | Every decision and why: content, design, functionality, hosting, research corrections. |
| `questions-for-valeriy.md` | Open questions only Valeriy can answer. |
| `prompts.md` | The requests that drove the work, verbatim, and the research brief. |
| `study/audit.md` | Audit of the old site, with screenshots. |
| `research/facts.md` | Researched facts per job, each with a source URL and VERIFIED / UNVERIFIED / CONTRADICTION. |
| `original/` | Copy of the old site as it was on 30 Oct 2026 (HTML, CSS, JS, resume.md, ORCID data, photos). |
| `tools/orcid_to_json.py` | Refreshes `site/data/publications.json` from ORCID. |
| `tools/make_deploy.sh`, `wrangler.jsonc` | Assemble `deploy/` and publish it to Cloudflare (`npx wrangler@4 deploy`). The draft is marked noindex. |
| `tools/build.py` | Builds `site/index.html` and the review copy `artifact/index.html` from `site/src.html`. |

## Editing the site

- All text is in `site/src.html`; after editing, run `python3 tools/build.py`. Each sentence appears twice, side by side: `<span data-l="ru">…</span><span data-l="en">…</span>`. Change both.
- Link straight to a language with `#ru` or `#en`, e.g. `https://x2v0.github.io/#en`.
- Publications: run the two commands at the top of `tools/orcid_to_json.py`.
- PDF: open the page in Chrome, Ctrl+P (or the "Скачать PDF" button), Save as PDF. Or headless:
  `chrome --headless=new --no-pdf-header-footer --print-to-pdf=cv_en.pdf "http://localhost:8000/#en"`
  (or open `site/index.html` from disk; it needs nothing else).
