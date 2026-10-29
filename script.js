(() => {
  "use strict";

  const README_URL = "https://raw.githubusercontent.com/x2v0/Resume/main/README.md";
  const homePage = document.getElementById("home-page");
  const resumePage = document.getElementById("resume-page");
  const resumeStatus = document.getElementById("resume-status");
  const resumeContent = document.getElementById("resume-content");
  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-navigation");
  let resumeRequest;

  function updateYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("#current-year, [data-current-year]").forEach((node) => {
      node.textContent = year;
    });
  }

  function updateNavigation() {
    const onResume = window.location.hash === "#resume";
    homePage.hidden = onResume;
    resumePage.hidden = !onResume;
    document.title = onResume
      ? "Резюме — Валерий Онучин"
      : "Валерий Онучин — инженер-программист";

    document.querySelectorAll("[data-resume-link]").forEach((link) => {
      if (onResume) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (onResume) {
      loadResume();
    }
  }

  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
    navigation.classList.remove("is-open");
  }

  function resolveSafeLink(rawUrl) {
    const url = rawUrl.trim();
    try {
      const parsed = new URL(url, README_URL);
      if (["https:", "http:", "mailto:"].includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch {
      return "";
    }
    return "";
  }

  function appendInline(parent, source) {
    const expression = /(\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|\*([^*]+)\*|_([^_]+)_|~~([\s\S]+?)~~|`([^`]+)`|(https?:\/\/[^\s<>]+))/g;
    let cursor = 0;
    let match;

    while ((match = expression.exec(source)) !== null) {
      parent.append(document.createTextNode(source.slice(cursor, match.index)));

      if (match[2] !== undefined) {
        const href = resolveSafeLink(match[3]);
        if (!href) {
          parent.append(document.createTextNode(match[2]));
        } else {
          const anchor = document.createElement("a");
          anchor.href = href;
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
          if (match[4]) anchor.title = match[4];
          appendInline(anchor, match[2]);
          parent.append(anchor);
        }
      } else if (match[5] !== undefined || match[6] !== undefined) {
        const strong = document.createElement("strong");
        appendInline(strong, match[5] ?? match[6]);
        parent.append(strong);
      } else if (match[7] !== undefined || match[8] !== undefined) {
        const emphasis = document.createElement("em");
        appendInline(emphasis, match[7] ?? match[8]);
        parent.append(emphasis);
      } else if (match[9] !== undefined) {
        const deletion = document.createElement("del");
        appendInline(deletion, match[9]);
        parent.append(deletion);
      } else if (match[10] !== undefined) {
        const code = document.createElement("code");
        code.textContent = match[10];
        parent.append(code);
      } else {
        const rawUrl = match[11];
        const cleanUrl = rawUrl.replace(/[.,;:!?]+$/, "");
        const href = resolveSafeLink(cleanUrl);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = cleanUrl;
        parent.append(anchor, document.createTextNode(rawUrl.slice(cleanUrl.length)));
      }

      cursor = expression.lastIndex;
    }

    parent.append(document.createTextNode(source.slice(cursor)));
  }

  function getListMatch(line) {
    const match = line.match(/^(\s*)([-+*]|\d+[.)])\s+(.*)$/);
    if (!match) return null;
    const indent = match[1].replace(/\t/g, "  ").length;
    return {
      indent,
      ordered: /^\d/.test(match[2]),
      text: match[3]
    };
  }

  function parseList(lines, start, baseIndent, ordered) {
    const list = document.createElement(ordered ? "ol" : "ul");
    let index = start;
    let lastItem = null;
    let hardBreakAfterLastText = false;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        let next = index + 1;
        while (next < lines.length && !lines[next].trim()) next += 1;
        const nextMatch = next < lines.length ? getListMatch(lines[next]) : null;
        if (nextMatch && nextMatch.indent >= baseIndent) {
          index = next;
          continue;
        }
        break;
      }

      const item = getListMatch(line);
      if (!item) {
        const indent = line.match(/^\s*/)[0].replace(/\t/g, "  ").length;
        if (lastItem && indent > baseIndent) {
          const hardBreak = /(?:\\| {2,})$/.test(line);
          const continuation = line.replace(/(?:\\| {2,})$/, "").trim();
          if (hardBreakAfterLastText) lastItem.append(document.createElement("br"));
          else lastItem.append(document.createTextNode(" "));
          appendInline(lastItem, continuation);
          hardBreakAfterLastText = hardBreak;
          index += 1;
          continue;
        }
        break;
      }
      if (item.indent < baseIndent) break;

      if (item.indent > baseIndent) {
        if (!lastItem) break;
        const nested = parseList(lines, index, item.indent, item.ordered);
        if (nested.index === index) break;
        lastItem.append(nested.list);
        index = nested.index;
        continue;
      }

      if (item.ordered !== ordered) break;
      lastItem = document.createElement("li");
      hardBreakAfterLastText = /(?:\\| {2,})$/.test(item.text);
      appendInline(lastItem, item.text.replace(/(?:\\| {2,})$/, "").trimEnd());
      list.append(lastItem);
      index += 1;
    }

    return { list, index };
  }

  function isTableDelimiter(line) {
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
    return cells.length > 1 && cells.every((cell) => /^\s*:?-{3,}:?\s*$/.test(cell));
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim().replace(/\\\|/g, "|"));
  }

  function renderTable(lines, start) {
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const body = document.createElement("tbody");
    const headers = splitTableRow(lines[start]);
    const alignments = splitTableRow(lines[start + 1]).map((cell) => {
      if (cell.startsWith(":") && cell.endsWith(":")) return "center";
      if (cell.endsWith(":")) return "right";
      return "left";
    });
    const headingRow = document.createElement("tr");

    headers.forEach((text, cellIndex) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.style.textAlign = alignments[cellIndex] || "left";
      appendInline(cell, text);
      headingRow.append(cell);
    });
    head.append(headingRow);
    table.append(head);

    let index = start + 2;
    while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
      const values = splitTableRow(lines[index]);
      const row = document.createElement("tr");
      headers.forEach((_, cellIndex) => {
        const cell = document.createElement("td");
        cell.style.textAlign = alignments[cellIndex] || "left";
        appendInline(cell, values[cellIndex] || "");
        row.append(cell);
      });
      body.append(row);
      index += 1;
    }
    table.append(body);
    return { table, index };
  }

  function isBlockStart(lines, index) {
    const line = lines[index];
    if (!line || !line.trim()) return true;
    if (/^\s{0,3}#{1,6}\s+/.test(line)) return true;
    if (/^\s{0,3}(?:-{3,}|_{3,}|\*{3,})\s*$/.test(line)) return true;
    if (/^\s{0,3}>/.test(line)) return true;
    if (getListMatch(line)) return true;
    return Boolean(lines[index + 1] && line.includes("|") && isTableDelimiter(lines[index + 1]));
  }

  function parseMarkdown(markdown) {
    const normalized = markdown
      .replace(/\]\(\s*((?:https?:\/\/)[^\s)]+)\s*\)/g, "]($1)")
      .replace(/\r\n?/g, "\n");
    const lines = normalized.split("\n");
    const fragment = document.createDocumentFragment();
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const element = document.createElement(`h${heading[1].length}`);
        appendInline(element, heading[2]);
        fragment.append(element);
        index += 1;
        continue;
      }

      if (/^\s{0,3}(?:-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
        fragment.append(document.createElement("hr"));
        index += 1;
        continue;
      }

      if (lines[index + 1] && line.includes("|") && isTableDelimiter(lines[index + 1])) {
        const rendered = renderTable(lines, index);
        fragment.append(rendered.table);
        index = rendered.index;
        continue;
      }

      const listMatch = getListMatch(line);
      if (listMatch) {
        const rendered = parseList(lines, index, listMatch.indent, listMatch.ordered);
        fragment.append(rendered.list);
        index = rendered.index > index ? rendered.index : index + 1;
        continue;
      }

      if (/^\s{0,3}>/.test(line)) {
        const quote = document.createElement("blockquote");
        const paragraph = document.createElement("p");
        const quoteLines = [];
        while (index < lines.length && /^\s{0,3}>/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^\s{0,3}>\s?/, "").trim());
          index += 1;
        }
        appendInline(paragraph, quoteLines.join(" "));
        quote.append(paragraph);
        fragment.append(quote);
        continue;
      }

      const paragraph = document.createElement("p");
      const paragraphLines = [];
      while (index < lines.length && !isBlockStart(lines, index)) {
        const raw = lines[index];
        const hardBreak = /(?:\\| {2,})$/.test(raw);
        paragraphLines.push({
          text: raw.replace(/(?:\\| {2,})$/, "").trim(),
          hardBreak
        });
        index += 1;
      }

      paragraphLines.forEach((part, partIndex) => {
        appendInline(paragraph, part.text);
        if (partIndex < paragraphLines.length - 1) {
          if (part.hardBreak) paragraph.append(document.createElement("br"));
          else paragraph.append(document.createTextNode(" "));
        }
      });
      fragment.append(paragraph);
    }

    return fragment;
  }

  async function loadResume() {
    if (resumeRequest) return resumeRequest;

    resumeStatus.classList.remove("is-error");
    resumeStatus.textContent = "Загружаем резюме…";
    resumeRequest = fetch(README_URL, { headers: { Accept: "text/plain" } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((markdown) => {
        resumeContent.replaceChildren(parseMarkdown(markdown));
        resumeStatus.textContent = "";
      })
      .catch((error) => {
        console.error("Не удалось загрузить Markdown резюме:", error);
        resumeStatus.classList.add("is-error");
        resumeStatus.textContent = "";

        const message = document.createElement("span");
        message.textContent = "Не удалось загрузить резюме. Проверьте подключение к сети или откройте исходный Markdown: ";
        const sourceLink = document.createElement("a");
        sourceLink.href = README_URL;
        sourceLink.target = "_blank";
        sourceLink.rel = "noopener noreferrer";
        sourceLink.textContent = "README.md";
        const retry = document.createElement("button");
        retry.type = "button";
        retry.textContent = "Повторить";
        retry.addEventListener("click", () => {
          resumeRequest = null;
          loadResume();
        });
        resumeStatus.append(message, sourceLink, retry);
      });

    return resumeRequest;
  }

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
    if (navigation) {
      navigation.classList.toggle("is-open", !isOpen);
    }
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener("hashchange", updateNavigation);
  updateYear();
  updateNavigation();
})();

// ── ORCID Publications with Search ──
document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('orcid-publications-list');
    const searchInput = document.getElementById('pub-search');
    if (!listContainer) return;
    
    let allPubs = [];

    function renderPubs(filter = '') {
        const filtered = allPubs.filter(p => 
            p.title.toLowerCase().includes(filter.toLowerCase()) || 
            p.year.includes(filter)
        );
        if (filtered.length === 0) {
            listContainer.innerHTML = '<p style="color:#666;">Ничего не найдено.</p>';
            return;
        }
        let html = '<ol style="padding-left: 20px; display: flex; flex-direction: column; gap: 12px;">';
        filtered.forEach(p => {
            html += `<li style="margin-bottom: 0;"><strong>${p.title}</strong> (${p.year})`;
            if (p.journal) html += ` <i>${p.journal}</i>.`;
            if (p.doi) html += ` <a href="https://doi.org/${p.doi}" target="_blank" style="color: #0288d1; text-decoration: none;">[DOI]</a>`;
            html += `</li>`;
        });
        html += '</ol>';
        listContainer.innerHTML = html;
    }

    try {
        const response = await fetch('https://pub.orcid.org/v3.0/0009-0000-3022-3529/works', { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        
        if (data.group && data.group.length > 0) {
            allPubs = data.group.map(item => {
                const work = item['work-summary'][0];
                const title = work.title.title.value;
                const year = work['publication-date']?.year?.value || 'N/A';
                const journal = work['journal-title']?.value || '';
                let doi = '';
                if (work['external-ids'] && work['external-ids']['external-id']) {
                    const doiObj = work['external-ids']['external-id'].find(id => id['external-id-type'] === 'doi');
                    if (doiObj) doi = doiObj['external-id-value'];
                }
                return { title, year, journal, doi };
            });
            renderPubs();
            if (searchInput) {
                searchInput.addEventListener('input', (e) => renderPubs(e.target.value));
            }
        } else {
            listContainer.innerHTML = '<p>No publications found.</p>';
        }
    } catch (error) {
        console.error('Error fetching ORCID:', error);
        listContainer.innerHTML = '<p style="color: #f66;">Не удалось загрузить публикации с ORCID.<br>Возможно, ваш VPN блокирует запросы к pub.orcid.org.<br><button onclick="location.reload()" style="margin-top:10px; padding:5px 10px; background:#0288d1; color:#fff; border:none; border-radius:4px; cursor:pointer;">Повторить</button></p>';
    }
});
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (!data.group || data.group.length === 0) {
            listContainer.innerHTML = '<p>No publications found.</p>';
            return;
        }

        let html = '<ol style="padding-left: 20px; display: flex; flex-direction: column; gap: 12px;">';
        
        data.group.forEach(item => {
            const work = item['work-summary'][0];
            const title = work.title.title.value;
            const year = work['publication-date']?.year?.value || 'N/A';
            const journal = work['journal-title']?.value || '';
            
            // Ищем DOI
            let doi = '';
            if (work['external-ids'] && work['external-ids']['external-id']) {
                const doiObj = work['external-ids']['external-id'].find(id => id['external-id-type'] === 'doi');
                if (doiObj) doi = doiObj['external-id-value'];
            }

            html += `<li style="margin-bottom: 0;">`;
            html += `<strong>${title}</strong> (${year})`;
            if (journal) html += ` <i>${journal}</i>.`;
            if (doi) html += ` <a href="https://doi.org/${doi}" target="_blank" style="color: #0288d1; text-decoration: none;">[DOI]</a>`;
            html += `</li>`;
        });
        
        html += '</ol>';
        listContainer.innerHTML = html;

    } catch (error) {
        console.error('Error fetching ORCID:', error);
        listContainer.innerHTML = '<p style="color: red;">Failed to load publications. Please check your connection or the ORCID API.</p>';
    }
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
if (currentTheme === 'dark' && themeToggle) themeToggle.textContent = '☀️';
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

// Scroll to Top
const scrollBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () => {
    if (scrollBtn) {
        if (window.scrollY > 300) scrollBtn.classList.add('show');
        else scrollBtn.classList.remove('show');
    }
});
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// GitHub Stats
fetch('https://api.github.com/users/x2v0')
    .then(r => r.json())
    .then(data => {
        const el = document.getElementById('github-stats');
        if (el) {
            el.innerHTML = `<span>Repos: <b>${data.public_repos}</b></span><span>Followers: <b>${data.followers}</b></span>`;
        }
    }).catch(e => {
        console.error('GitHub API error', e);
        const el = document.getElementById('github-stats');
        if (el) el.innerHTML = '<span style="color:#888">GitHub API limit reached</span>';
    });

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg failed', err));
    });
}

// Анимации при скролле
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Контактная форма (mailto)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('c-name').value;
        const email = document.getElementById('c-email').value;
        const msg = document.getElementById('c-msg').value;
        
        // Замени 'valeriy.onuchin@ya.ru' на свой реальный email!
        const mailtoLink = `mailto:valeriy.onuchin@ya.ru?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(msg + '\n\nОт: ' + email)}`;
        window.location.href = mailtoLink;
    });
}
