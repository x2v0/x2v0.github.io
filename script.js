
document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');
    var resumePage = document.getElementById('resume-page');
    var resumeContent = document.getElementById('resume-content');
    var scrollBtn = document.getElementById('scroll-top');

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

    // 5. Резюме (как в Replit)
    var resumeLink = document.querySelector('a[href="#resume"]');
    if (resumeLink && resumePage) {
        resumeLink.onclick = function(e) {
            e.preventDefault();
            if (mainContent) mainContent.style.display = 'none';
            if (dynamicContent) dynamicContent.style.display = 'none';
            resumePage.style.display = 'block';
            window.scrollTo(0, 0);

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
                    .catch(function(err) {
                        resumeContent.innerHTML = '<p style="color:red;">Ошибка загрузки</p>';
                    });
            }
        };
    }

    // 6. Загрузка Портфолио и Блога (через fetch)
    function loadPage(url, title) {
        if (!dynamicContent || !mainContent) return;
        
        dynamicContent.innerHTML = '<p style="text-align:center; padding:50px;">Загрузка ' + title + '...</p>';
        dynamicContent.style.display = 'block';
        mainContent.style.display = 'none';
        if (resumePage) resumePage.style.display = 'none';
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
                    dynamicContent.style.display = 'none';
                    mainContent.style.display = '';
                    window.scrollTo(0, 0);
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

    // 7. Логотип (ВО) — возврат
    var brandLink = document.querySelector('.brand');
    if (brandLink) {
        brandLink.onclick = function(e) {
            if ((dynamicContent && dynamicContent.style.display === 'block') || 
                (resumePage && resumePage.style.display === 'block')) {
                e.preventDefault();
                if (dynamicContent) dynamicContent.style.display = 'none';
                if (resumePage) resumePage.style.display = 'none';
                if (mainContent) mainContent.style.display = '';
                window.scrollTo(0, 0);
            }
        };
    }
});
