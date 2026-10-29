document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    
    // 1. Мобильное меню
    if (menuBtn && nav) {
        menuBtn.onclick = function(e) {
            e.preventDefault();
            nav.classList.toggle('is-open');
        };
    }

    // 2. Переключение темы
    var themeBtn = document.getElementById('theme-toggle');
    var currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeBtn) {
        themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        themeBtn.onclick = function() {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            var newTheme = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        };
    }

    // 3. API Загрузки (GitHub, ORCID)
    var ghEl = document.getElementById('github-stats');
    if (ghEl) {
        fetch('https://api.github.com/users/x2v0')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.public_repos !== undefined) {
                    ghEl.innerHTML = '<span>Repos: <b>' + data.public_repos + '</b></span> | <span>Followers: <b>' + data.followers + '</b></span>';
                }
            }).catch(function() { ghEl.innerHTML = 'GitHub API Error'; });
    }

    var listContainer = document.getElementById('orcid-publications-list');
    if (listContainer) {
        fetch('https://pub.orcid.org/v3.0/0009-0000-3022-3529/works', { headers: { 'Accept': 'application/json' } })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (!data.group) throw new Error('No data');
                var allPubs = data.group.map(function(item) {
                    var work = item['work-summary'][0];
                    var year = work['publication-date'] && work['publication-date'].year ? work['publication-date'].year.value : '';
                    var doi = '';
                    if (work['external-ids'] && work['external-ids']['external-id']) {
                        var ids = work['external-ids']['external-id'];
                        for (var k = 0; k < ids.length; k++) {
                            if (ids[k]['external-id-type'] === 'doi') doi = ids[k]['external-id-value'];
                        }
                    }
                    return { title: work.title.title.value, year: year, doi: doi };
                });

                var render = function(filter) {
                    filter = filter || '';
                    var filtered = allPubs.filter(function(p){ return p.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || p.year.indexOf(filter) !== -1; });
                    if (!filtered.length) { listContainer.innerHTML = '<p>Нет результатов.</p>'; return; }
                    var html = '<ol style="padding-left: 20px; display: flex; flex-direction: column; gap: 10px;">';
                    for (var i = 0; i < filtered.length; i++) {
                        var p = filtered[i];
                        html += '<li><strong>' + p.title + '</strong> (' + p.year + ')';
                        if (p.doi) html += ' <a href="https://doi.org/' + p.doi + '" target="_blank">[DOI]</a>';
                        html += '</li>';
                    }
                    listContainer.innerHTML = html + '</ol>';
                };
                render();
                var searchInput = document.getElementById('pub-search');
                if (searchInput) searchInput.oninput = function(e) { render(e.target.value); };
            })
            .catch(function() { listContainer.innerHTML = '<p style="color:red;">Ошибка загрузки ORCID (VPN?)</p>'; });
    }

    // 4. Кнопка вверх
    var scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) {
        window.addEventListener('scroll', function() { scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none'; });
        scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    }

    // 5. Форма
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.onsubmit = function(e) {
            e.preventDefault();
            var name = document.getElementById('c-name').value;
            var email = document.getElementById('c-email').value;
            var msg = document.getElementById('c-msg').value;
            window.location.href = 'mailto:valeriy.onuchin@ya.ru?subject=Contact from ' + encodeURIComponent(name) + '&body=' + encodeURIComponent(msg + '\\n\\nОт: ' + email);
        };
    }

    // 6. SPA Навигация
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');

    function loadPage(url) {
        if (!dynamicContent || !mainContent) return;
        dynamicContent.innerHTML = '<p style="text-align:center; padding:50px;">Загрузка...</p>';
        dynamicContent.style.display = 'block';
        mainContent.style.display = 'none';

        fetch(url)
            .then(function(r) { return r.text(); })
            .then(function(htmlText) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(htmlText, 'text/html');
                dynamicContent.innerHTML = doc.body.innerHTML;
                
                var backBtn = document.createElement('button');
                backBtn.innerHTML = '← Назад на главную';
                backBtn.style.cssText = 'margin-bottom:20px; padding:10px 15px; background:#0288d1; color:#fff; border:none; border-radius:5px; cursor:pointer; font-family:inherit;';
                backBtn.onclick = function() {
                    dynamicContent.style.display = 'none';
                    mainContent.style.display = ''; 
                };
                dynamicContent.insertBefore(backBtn, dynamicContent.firstChild);
            })
            .catch(function(e) {
                dynamicContent.innerHTML = '<p style="color:red;">Ошибка загрузки страницы.</p>';
            });
    }

    var navPortfolio = document.getElementById('nav-portfolio');
    var navBlog = document.getElementById('nav-blog');

    if (navPortfolio) {
        navPortfolio.onclick = function(e) {
            e.preventDefault();
            if (nav) nav.classList.remove('is-open');
            loadPage('./portfolio/index.html');
        };
    }
    if (navBlog) {
        navBlog.onclick = function(e) {
            e.preventDefault();
            if (nav) nav.classList.remove('is-open');
            loadPage('./year-archive/index.html');
        };
    }
});
