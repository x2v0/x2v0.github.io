
// Простые тесты для проверки работоспособности сайта
// Открой консоль браузера (F12 или через меню), чтобы увидеть результаты

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.group('🧪 x2v0.github.io Tests');
        
        // 1. Проверка загрузки скриптов
        console.assert(typeof window.addEventListener === 'function', '✅ Базовые DOM API доступны');
        
        // 2. Проверка элементов интерфейса
        console.assert(!!document.getElementById('theme-toggle'), '✅ Кнопка темы существует');
        console.assert(!!document.getElementById('menu-toggle'), '✅ Кнопка меню существует');
        console.assert(!!document.getElementById('site-navigation'), '✅ Блок навигации существует');
        
        // 3. Проверка контента
        console.assert(!!document.querySelector('h1'), '✅ Заголовок H1 найден');
        console.assert(document.body.innerHTML.includes('15,108'), '✅ Метрики Scopus обновлены');
        
        // 4. Проверка API (запускается асинхронно)
        fetch('https://pub.orcid.org/v3.0/0009-0000-3022-3529/works', { headers: { 'Accept': 'application/json' } })
            .then(r => {
                console.assert(r.ok, '✅ ORCID API отвечает');
            })
            .catch(() => {
                console.warn('⚠️ ORCID API недоступен (возможно, блокировка VPN)');
            });

        console.log('Тестирование завершено. Если нет красных ошибок — всё отлично!');
        console.groupEnd();
    }, 2000); // Ждем 2 секунды, чтобы все скрипты прогрузились
});
