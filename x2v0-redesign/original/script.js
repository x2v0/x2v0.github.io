document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');
    var scrollBtn = document.getElementById('scroll-top');
    var resumePage = document.getElementById('resume-page');
    var resumeContent = document.getElementById('resume-content');
    var resumeBackBtn = document.getElementById('resume-back-btn');

    // 1. Мобильное меню
    if (menuBtn && nav) {
        menuBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle('is-open');
            menuBtn.classList.toggle('is-active');
        };
    }

    // 2. Закрытие меню
    document.addEventListener('click', function(e) {
        if (nav && nav.classList.contains('is-open')) {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('is-open');
                menuBtn.classList.remove('is-active');
            }
        }
    });

    // 3. Тема
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

    // 4. Кнопка Наверх
    if (scrollBtn) {
        window.addEventListener('scroll', function() {
            scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        scrollBtn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    }

    // 5. Резюме
    var resumeLink = document.querySelector('a[href="#resume"]');
    if (resumeLink && resumePage) {
        resumeLink.onclick = function(e) {
            e.preventDefault();
            if (mainContent) mainContent.style.display = 'none';
            if (dynamicContent) { dynamicContent.style.display = 'none'; dynamicContent.innerHTML = ''; }
            resumePage.style.display = 'block';
            window.scrollTo(0, 0);
            if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }

            if (resumeContent && resumeContent.innerHTML.indexOf('Загрузка') !== -1) {
                fetch('./resume.md')
                    .then(function(r) { return r.text(); })
                    .then(function(md) {
                        if (typeof marked !== 'undefined') resumeContent.innerHTML = marked.parse(md);
                        else resumeContent.innerHTML = '<pre style="white-space: pre-wrap;">' + md + '</pre>';
                    })
                    .catch(function(err) { resumeContent.innerHTML = '<p style="color:red;">Ошибка: ' + err.message + '</p>'; });
            }
        };
    }

    if (resumeBackBtn) {
        resumeBackBtn.onclick = function() {
            resumePage.style.display = 'none';
            if (mainContent) mainContent.style.display = '';
            window.scrollTo(0, 0);
        };
    }

    // 6. Загрузка Публикаций (ORCID) из локального файла
    var listContainer = document.getElementById('orcid-publications-list');
    if (listContainer) {
        fetch('./orcid_works.json')
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
                    var filtered = allPubs.filter(function(p){ 
                        return p.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || p.year.indexOf(filter) !== -1; 
                    });
                    
                    if (!filtered.length) { 
                        listContainer.innerHTML = '<p>Нет результатов.</p>'; 
                        return; 
                    }
                    
                    // Оборачиваем таблицу в div для горизонтальной прокрутки на узких экранах
                    var html = '<div style="overflow-x: auto;"><table class="publications-table" style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px;">';
                    html += '<thead><tr>';
                    html += '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border, #444); white-space: nowrap;">Год</th>';
                    html += '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border, #444);">Название</th>';
                    html += '<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border, #444);">Ссылка</th>';
                    html += '</tr></thead><tbody>';
                    
                    for (var i = 0; i < filtered.length; i++) {
                        var p = filtered[i];
                        html += '<tr>';
                        html += '<td style="padding: 8px; border-bottom: 1px solid var(--border, #333); white-space: nowrap; vertical-align: top;">' + p.year + '</td>';
                        html += '<td style="padding: 8px; border-bottom: 1px solid var(--border, #333); vertical-align: top;">' + p.title + '</td>';
                        html += '<td style="padding: 8px; border-bottom: 1px solid var(--border, #333); vertical-align: top;">';
                        if (p.doi) {
                            html += '<a href="https://doi.org/' + p.doi + '" target="_blank" style="color: #4fc3f7;">DOI</a>';
                        } else {
                            html += '-';
                        }
                        html += '</td>';
                        html += '</tr>';
                    }
                    
                    html += '</tbody></table></div>';
                    listContainer.innerHTML = html;
                };
                render();
                var searchInput = document.getElementById('pub-search');
                if (searchInput) searchInput.oninput = function(e) { render(e.target.value); };
            })
            .catch(function(err) { 
                listContainer.innerHTML = '<p style="color:red;">Ошибка загрузки публикаций: ' + err.message + '</p>'; 
            });
    }

    // 7. Портфолио и Блог
    function loadPage(url) {
        if (!dynamicContent || !mainContent) return;
        dynamicContent.innerHTML = '';
        dynamicContent.style.display = 'block';
        mainContent.style.display = 'none';
        if (resumePage) resumePage.style.display = 'none';
        window.scrollTo(0, 0);

        var backBtn = document.createElement('button');
        backBtn.innerHTML = '← Назад на главную';
        backBtn.style.cssText = 'margin: 20px; padding: 10px 15px; background:#0288d1; color:#fff; border:none; border-radius:5px; cursor:pointer; font-size:16px;';
        backBtn.onclick = function() { dynamicContent.style.display = 'none'; mainContent.style.display = ''; window.scrollTo(0, 0); };
        dynamicContent.appendChild(backBtn);

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

    // 8. Якоря (Публикации) - Назад + Скролл
    var navLinks = document.querySelectorAll('.main-nav a');
    for (var i = 0; i < navLinks.length; i++) {
        var href = navLinks[i].getAttribute('href');
        if (href && href.indexOf('#') === 0 && href !== '#portfolio' && href !== '#blog' && href !== '#resume') {
            navLinks[i].onclick = function(e) {
                e.preventDefault();
                var targetEl = document.querySelector(this.getAttribute('href'));
                if (mainContent) mainContent.style.display = '';
                if (dynamicContent) { dynamicContent.style.display = 'none'; dynamicContent.innerHTML = ''; }
                if (resumePage) resumePage.style.display = 'none';
                if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
                if (targetEl) setTimeout(function() { targetEl.scrollIntoView({ behavior: 'smooth' }); }, 50);
            };
        }
    }

    // 9. Логотип (ВО)
    var brandLink = document.querySelector('.brand');
    if (brandLink) {
        brandLink.onclick = function(e) {
            if ((dynamicContent && dynamicContent.style.display === 'block') || (resumePage && resumePage.style.display === 'block')) {
                e.preventDefault();
                if (dynamicContent) { dynamicContent.style.display = 'none'; dynamicContent.innerHTML = ''; }
                if (resumePage) resumePage.style.display = 'none';
                if (mainContent) mainContent.style.display = '';
                window.scrollTo(0, 0);
            }
        };
    }
});
