document.addEventListener('DOMContentLoaded', () => {
    // 1. Мобильное меню
    const menuBtn = document.getElementById('menu-toggle');
    const nav = document.getElementById('site-navigation');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nav.classList.toggle('is-open');
        });
    }

    // 2. Переключение темы
    const themeBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeBtn) {
        themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    // 3. Кнопка "Наверх"
    const scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 4. Статистика GitHub
    fetch('https://api.github.com/users/x2v0')
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById('github-stats');
            if (el && data.public_repos !== undefined) {
                el.innerHTML = `<span>Repos: <b>${data.public_repos}</b></span> <span>Followers: <b>${data.followers}</b></span>`;
            }
        }).catch(e => console.log('GitHub API error'));

    // 5. Публикации ORCID
    const listContainer = document.getElementById('orcid-publications-list');
    const searchInput = document.getElementById('pub-search');
    if (listContainer) {
        fetch('https://pub.orcid.org/v3.0/0009-0000-3022-3529/works', { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => {
                if (!data.group) throw new Error('No data');
                let allPubs = data.group.map(item => {
                    const work = item['work-summary'][0];
                    const title = work.title.title.value;
                    const year = work['publication-date']?.year?.value || '';
                    const journal = work['journal-title']?.value || '';
                    let doi = '';
                    if (work['external-ids']?.['external-id']) {
                        const doiObj = work['external-ids']['external-id'].find(id => id['external-id-type'] === 'doi');
                        if (doiObj) doi = doiObj['external-id-value'];
                    }
                    return { title, year, journal, doi };
                });

                const render = (filter = '') => {
                    const filtered = allPubs.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()) || p.year.includes(filter));
                    if (!filtered.length) {
                        listContainer.innerHTML = '<p>Ничего не найдено.</p>';
                        return;
                    }
                    let html = '<ol style="padding-left: 20px; display: flex; flex-direction: column; gap: 12px;">';
                    filtered.forEach(p => {
                        html += `<li><strong>${p.title}</strong> (${p.year})`;
                        if (p.journal) html += ` <i>${p.journal}</i>.`;
                        if (p.doi) html += ` <a href="https://doi.org/${p.doi}" target="_blank" style="color: #0288d1;">[DOI]</a>`;
                        html += `</li>`;
                    });
                    listContainer.innerHTML = html + '</ol>';
                };

                render();
                if (searchInput) searchInput.addEventListener('input', (e) => render(e.target.value));
            })
            .catch(e => {
                listContainer.innerHTML = '<p style="color: #f66;">Ошибка загрузки ORCID. Возможно, блокирует VPN.</p>';
            });
    }

    // 6. Анимации при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 7. Контактная форма
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('c-name').value;
            const email = document.getElementById('c-email').value;
            const msg = document.getElementById('c-msg').value;
            window.location.href = `mailto:valeriy.onuchin@ya.ru?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(msg + '\n\nОт: ' + email)}`;
        });
    }

    // 8. Убиваем бейдж Replit (если он есть)
    setTimeout(() => {
        document.querySelectorAll('iframe[src*="replit"], a[href*="replit"], [class*="replit-badge"], [id*="replit"]').forEach(el => el.remove());
    }, 1000);
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg failed'));
    });
}
