
document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');
    var brandLink = document.querySelector('.brand');
    var resumePage = document.getElementById('resume-page');
    var resumeContent = document.getElementById('resume-content');

    // 1. Мобильное меню (с анимацией крестика)
    if (menuBtn && nav) {
        menuBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle('is-open');
            menuBtn.classList.toggle('is-active');
        };
    }

    // 2. Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (nav && nav.classList.contains('is-open')) {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('is-open');
                menuBtn.classList.remove('is-active');
            }
        }
    });

    // 3. Закрываем меню при клике на ссылку
    if (nav) {
        var links = nav.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                nav.classList.remove('is-open');
                if (menuBtn) menuBtn.classList.remove('is-active');
            });
        }
    }

    // 4. Переключение темы
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

    // 5. API Загрузки (GitHub, ORCID)
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

    // 6. Кнопка вверх и форма
    var scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) {
        window.addEventListener('scroll', function() { scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none'; });
        scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    }

    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.onsubmit = function(e) {
            e.preventDefault();
            var name = document.getElementById('c-name').value;
            var email = document.getElementById('c-email').value;
            var msg = document.getElementById('c-msg').value;
            window.location.href = 'mailto:valeriy.onuchin@yandex.ru?subject=Contact from ' + encodeURIComponent(name) + '&body=' + encodeURIComponent(msg + '\n\nОт: ' + email);
        };
    }

    // 7. SPA Навигация (Портфолио и Блог)
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

    // 8. Резюме (SPA)
    var resumeLink = document.querySelector('a[href="#resume"]');
    if (resumeLink && resumePage) {
        resumeLink.onclick = function(e) {
            e.preventDefault();
            if (mainContent) mainContent.style.display = 'none';
            if (dynamicContent) dynamicContent.style.display = 'none';
            resumePage.style.display = 'block';
            window.scrollTo(0, 0);
            
            // Загружаем Markdown, если еще не загружен
            if (resumeContent && resumeContent.innerHTML === 'Загрузка резюме с GitHub...') {
                fetch('https://raw.githubusercontent.com/x2v0/Resume/main/README.md')
                    .then(function(r) { return r.text(); })
                    .then(function(md) {
                        if (typeof marked !== 'undefined') {
                            resumeContent.innerHTML = marked.parse(md);
                        } else {
                            resumeContent.innerHTML = '<pre>' + md + '</pre>';
                        }
                    })
                    .catch(function() { resumeContent.innerHTML = '<p style="color:red;">Не удалось загрузить резюме.</p>'; });
            }
        };
    }

    // 9. Логотип (ВО) — возврат на главную
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

    // 10. Анимация появления блоков при скролле
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        var reveals = document.querySelectorAll('.reveal');
        for (var r = 0; r < reveals.length; r++) {
            observer.observe(reveals[r]);
        }
    }
});
