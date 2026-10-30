document.addEventListener('DOMContentLoaded', function() {
    var nav = document.getElementById('site-navigation');
    var menuBtn = document.getElementById('menu-toggle');
    var mainContent = document.getElementById('home-page');
    var dynamicContent = document.getElementById('dynamic-content');
    var scrollBtn = document.getElementById('scroll-top');
    
    // Защита от повторного вызова
    var resumeLoaded = false;

    // 1. Мобильное меню
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

    // 3. Переключение темы
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

    // 5. Резюме (Безопасная ленивая загрузка)
    var resumeLink = document.querySelector('a[href="#resume"]');
    var resumePage = document.getElementById('resume-page');
    var resumeContent = document.getElementById('resume-content');
    var resumeBackBtn = document.getElementById('resume-back-btn');

    if (resumeLink && resumePage) {
        resumeLink.onclick = function(e) {
            e.preventDefault();
            if (mainContent) mainContent.style.display = 'none';
            if (dynamicContent) { dynamicContent.style.display = 'none'; dynamicContent.innerHTML = ''; }
            resumePage.style.display = 'block';
            window.scrollTo(0, 0);
            if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }

            // Если уже загружено или в процессе - ничего не делаем
            if (resumeLoaded) return;
            resumeLoaded = true;

            // Загружаем marked.js динамически, если его нет
            function fetchAndRender() {
                fetch('./resume.md')
                    .then(function(r) { return r.text(); })
                    .then(function(md) {
                        if (typeof marked !== 'undefined') {
                            resumeContent.innerHTML = marked.parse(md);
                        } else {
                            resumeContent.innerHTML = '<pre>' + md + '</pre>';
                        }
                    })
                    .catch(function() { resumeContent.innerHTML = '<p style="color:red;">Ошибка загрузки</p>'; });
            }

            if (typeof marked === 'undefined') {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
                script.onload = fetchAndRender;
                document.head.appendChild(script);
            } else {
                fetchAndRender();
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

    // 6. Портфолио и Блог (через iframe)
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
        backBtn.onclick = function() {
            dynamicContent.style.display = 'none';
            mainContent.style.display = '';
            window.scrollTo(0, 0);
        };
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

    // 7. Якоря (Публикации) - Сначала Назад, потом Скролл
    var navLinks = document.querySelectorAll('.main-nav a');
    for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i];
        var href = link.getAttribute('href');
        
        if (href && href.indexOf('#') === 0 && href !== '#portfolio' && href !== '#blog' && href !== '#resume') {
            link.onclick = function(e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                var targetEl = document.querySelector(targetId);
                
                if (mainContent) mainContent.style.display = '';
                if (dynamicContent) { dynamicContent.style.display = 'none'; dynamicContent.innerHTML = ''; }
                if (resumePage) resumePage.style.display = 'none';
                if (nav) { nav.classList.remove('is-open'); menuBtn.classList.remove('is-active'); }
                
                if (targetEl) {
                    setTimeout(function() {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            };
        }
    }

    // 8. Логотип (ВО)
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
