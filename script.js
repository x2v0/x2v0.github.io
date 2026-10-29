
document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');
    var brandLink = document.querySelector('.brand');
    var resumePage = document.getElementById('resume-page');
    var resumeContent = document.getElementById('resume-content');

    // 1. Мобильное меню
    if (menuBtn && nav) {
        menuBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle('is-open');
            menuBtn.classList.toggle('is-active');
        };
    }

    // Закрытие меню вне
    document.addEventListener('click', function(e) {
        if (nav && nav.classList.contains('is-open')) {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('is-open');
                menuBtn.classList.remove('is-active');
            }
        }
    });

    // 2. Тема
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

    // 3. Загрузка API (GitHub, ORCID)
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
            .catch(function() { listContainer.innerHTML = '<p style="color:red;">Ошибка загрузки ORCID</p>'; });
    }

    // 4. Резюме (SPA)
    var resumeLink = document.querySelector('a[href="#resume"]');
    if (resumeLink && resumePage) {
        resumeLink.onclick = function(e) {
            e.preventDefault();
            if (mainContent) mainContent.style.display = 'none';
            if (dynamicContent) dynamicContent.style.display = 'none';
            resumePage.style.display = 'block';
            window.scrollTo(0, 0);

            // Если резюме еще не загружено
            if (resumeContent && resumeContent.innerHTML === 'Загрузка резюме с GitHub...') {
                fetch('https://raw.githubusercontent.com/x2v0/Resume/main/README.md')
                    .then(function(r) {
                        if (!r.ok) throw new Error('Network error');
                        return r.text();
                    })
                    .then(function(md) {
                        if (typeof marked !== 'undefined') {
                            resumeContent.innerHTML = marked.parse(md);
                        } else {
                            // Если marked не загрузился, выводим как есть
                            resumeContent.innerHTML = '<pre style="white-space: pre-wrap;">' + md + '</pre>';
                        }
                    })
                    .catch(function(err) {
                        resumeContent.innerHTML = '<p style="color:red;">Не удалось загрузить резюме. Проверьте подключение к интернету.<br>Ошибка: ' + err.message + '</p>';
                    });
            }
        };
    }

    // 5. Навигация (Портфолио, Блог)
    function loadPage(url) {
        if (!dynamicContent || !mainContent) return;
        dynamicContent.innerHTML = '';
        dynamicContent.style.display = 'block';
        mainContent.style.display = 'none';
        if (resumePage) resumePage.style.display = 'none';
        window.scrollTo(0, 0);

        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = 'width: 100%; height: 85vh; border: none; border-top: 1px solid #ddd;';
        dynamicContent.appendChild(iframe);
    }

    var navPortfolio = document.getElementById('nav-portfolio');
    var navBlog = document.getElementById('nav-blog');

    if (navPortfolio) {
        navPortfolio.onclick = function(e) {
            e.preventDefault();
            if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
            loadPage('./portfolio/index.html');
        };
    }
    if (navBlog) {
        navBlog.onclick = function(e) {
            e.preventDefault();
            if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
            loadPage('./year-archive/index.html');
        };
    }

    // 6. Логотип (ВО) - возврат
    if (brandLink) {
        brandLink.onclick = function(e) {
            if ((dynamicContent && dynamicContent.style.display === 'block') || (resumePage && resumePage.style.display === 'block')) {
                e.preventDefault();
                if (dynamicContent) dynamicContent.style.display = 'none';
                if (resumePage) resumePage.style.display = 'none';
                if (mainContent) mainContent.style.display = '';
                window.scrollTo(0, 0);
            }
        };
    }

    // 7. Анимация скролла
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(function(el) {
            observer.observe(el);
        });
    }
});
