
document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');
    var resumePage = document.getElementById('resume-page');
    var resumeContent = document.getElementById('resume-content');
    var scrollBtn = document.getElementById('scroll-top');

    // Функция "Вернуться на главную" (сбрасывает все окна)
    function goHome() {
        if (mainContent) mainContent.style.display = '';
        if (dynamicContent) dynamicContent.style.display = 'none';
        if (resumePage) resumePage.style.display = 'none';
        if (dynamicContent) dynamicContent.innerHTML = ''; // Очищаем iframe/контент
    }

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
        scrollBtn.onclick = function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // 5. Резюме
    var resumeLink = document.querySelector('a[href="#resume"]');
    if (resumeLink) {
        resumeLink.onclick = function(e) {
            e.preventDefault();
            goHome();
            if (resumePage) resumePage.style.display = 'block';
            window.scrollTo(0, 0);

            if (resumeContent && resumeContent.innerHTML === 'Загрузка резюме с GitHub...') {
                fetch('https://raw.githubusercontent.com/x2v0/Resume/main/README.md')
                    .then(function(r) { return r.text(); })
                    .then(function(md) {
                        if (typeof marked !== 'undefined') resumeContent.innerHTML = marked.parse(md);
                        else resumeContent.innerHTML = '<pre>' + md + '</pre>';
                    })
                    .catch(function() { resumeContent.innerHTML = '<p style="color:red;">Ошибка загрузки</p>'; });
            }
        };
    }

    // 6. Загрузка Портфолио и Блога (с выполнением скриптов)
    function loadPage(url, title) {
        if (!dynamicContent || !mainContent) return;
        
        goHome(); // Сначала сбрасываем всё
        dynamicContent.innerHTML = '<p style="text-align:center; padding:50px;">Загрузка ' + title + '...</p>';
        dynamicContent.style.display = 'block';
        mainContent.style.display = 'none';
        window.scrollTo(0, 0);

        fetch(url)
            .then(function(r) { return r.text(); })
            .then(function(htmlText) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(htmlText, 'text/html');
                
                dynamicContent.innerHTML = '';

                var backBtn = document.createElement('button');
                backBtn.innerHTML = '← Назад на главную';
                backBtn.style.cssText = 'margin: 20px; padding: 10px 15px; background:#0288d1; color:#fff; border:none; border-radius:5px; cursor:pointer; font-size:16px;';
                backBtn.onclick = function() {
                    goHome();
                };
                dynamicContent.appendChild(backBtn);

                var contentDiv = document.createElement('div');
                contentDiv.innerHTML = doc.body.innerHTML;
                
                // Выполняем скрипты
                var scripts = contentDiv.querySelectorAll('script');
                for (var i = 0; i < scripts.length; i++) {
                    var newScript = document.createElement('script');
                    if (scripts[i].src) newScript.src = scripts[i].src;
                    else newScript.textContent = scripts[i].textContent;
                    scripts[i].parentNode.replaceChild(newScript, scripts[i]);
                }
                dynamicContent.appendChild(contentDiv);
            })
            .catch(function() {
                dynamicContent.innerHTML = '<p style="color:red; padding:20px;">Ошибка загрузки.</p>';
            });
    }

    var navPortfolio = document.getElementById('nav-portfolio');
    var navBlog = document.getElementById('nav-blog');

    if (navPortfolio) {
        navPortfolio.onclick = function(e) {
            e.preventDefault();
            if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
            loadPage('./portfolio/index.html', 'Portfolio');
        };
    }
    if (navBlog) {
        navBlog.onclick = function(e) {
            e.preventDefault();
            if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
            loadPage('./year-archive/index.html', 'Блог');
        };
    }

    // 7. Логотип (возврат)
    var brandLink = document.querySelector('.brand');
    if (brandLink) {
        brandLink.onclick = function(e) {
            if ((dynamicContent && dynamicContent.style.display === 'block') || (resumePage && resumePage.style.display === 'block')) {
                e.preventDefault();
                goHome();
            }
        };
    }

    // 8. ССЫЛКИ ЯКОРЕЙ (Публикации, Квалификация и т.д.) — Сначала Назад, потом Скролл
    var allLinks = document.querySelectorAll('.main-nav a');
    for (var l = 0; l < allLinks.length; l++) {
        var link = allLinks[l];
        var href = link.getAttribute('href');
        
        // Если это якорь (начинается с #), но не те, что мы уже обработали
        if (href && href.indexOf('#') === 0 && href !== '#portfolio' && href !== '#blog' && href !== '#resume') {
            link.onclick = function(e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                var targetEl = document.querySelector(targetId);
                
                goHome(); // 1. Возвращаемся на главную
                if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
                
                // 2. Скроллим к нужному блоку
                if (targetEl) {
                    setTimeout(function() {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            };
        }
    }
});
