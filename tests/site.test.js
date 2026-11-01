// site.test.js — Смоук-тесты для x2v0.github.io (блог + портфолио)
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Пути к файлам
const MAIN_HTML = path.resolve(__dirname, '..', 'index.html');
const PORTFOLIO_HTML = path.resolve(__dirname, '..', 'portfolio', 'index.html');
const BLOG_HTML = path.resolve(__dirname, '..', '..', 'blog-repo', 'index.html');
const TREE_JSON = path.resolve(__dirname, '..', '..', 'blog-repo', 'tree.json');

// ═══════════════════════════════════════════════════════
// 1. Проверка синтаксиса JS (без парсинга DOM)
// ═══════════════════════════════════════════════════════
test('Главная страница: скрипты не оборваны', () => {
    const html = fs.readFileSync(MAIN_HTML, 'utf-8');
    const openScripts = (html.match(/<script/g) || []).length;
    const closeScripts = (html.match(/<\/script>/g) || []).length;
    assert.strictEqual(openScripts, closeScripts, 'Количество <script> и </script> не совпадает!');
});

test('Блог: скрипты не оборваны', () => {
    const html = fs.readFileSync(BLOG_HTML, 'utf-8');
    const openScripts = (html.match(/<script/g) || []).length;
    const closeScripts = (html.match(/<\/script>/g) || []).length;
    assert.strictEqual(openScripts, closeScripts, 'Количество <script> и </script> не совпадает!');
});

// ═══════════════════════════════════════════════════════
// 2. Проверка наличия ключевых элементов (без JSDOM)
// ═══════════════════════════════════════════════════════
test('Главная: есть кнопка Наверх', () => {
    const html = fs.readFileSync(MAIN_HTML, 'utf-8');
    assert.ok(html.includes('id="scroll-top"'), 'Нет кнопки #scroll-top на главной');
});

test('Портфолио: есть кнопка Наверх', () => {
    const html = fs.readFileSync(PORTFOLIO_HTML, 'utf-8');
    assert.ok(html.includes('id="scroll-top"'), 'Нет кнопки #scroll-top в портфолио');
});

test('Блог: есть кнопка Наверх и поиск', () => {
    const html = fs.readFileSync(BLOG_HTML, 'utf-8');
    assert.ok(html.includes('id="scroll-top"'), 'Нет кнопки #scroll-top в блоге');
    assert.ok(html.includes('id="search-input"'), 'Нет поля поиска в блоге');
});

// ═══════════════════════════════════════════════════════
// 3. Проверка tree.json
// ═══════════════════════════════════════════════════════
test('tree.json: валидный JSON и не пустой', () => {
    const raw = fs.readFileSync(TREE_JSON, 'utf-8');
    const tree = JSON.parse(raw);
    assert.ok(Array.isArray(tree), 'tree.json должен быть массивом');
    assert.ok(tree.length > 0, 'tree.json не должен быть пустым');
});

// ═══════════════════════════════════════════════════════
// 4. Проверка работы кнопки Наверх через JSDOM (если есть)
// ═══════════════════════════════════════════════════════
let JSDOM;
try {
    JSDOM = require('jsdom').JSDOM;
} catch (e) {
    console.log('⚠ jsdom не установлен. Пропускаем тест работы кнопки.');
}

if (JSDOM) {
    test('Блог: кнопка Наверх вызывает window.scrollTo', () => {
        const html = fs.readFileSync(BLOG_HTML, 'utf-8');
        const dom = new JSDOM(html, { runScripts: 'dangerously' });
        const window = dom.window;
        
        let scrolled = false;
        window.scrollTo = () => { scrolled = true; };
        
        const btn = window.document.getElementById('scroll-top');
        assert.ok(btn, 'Кнопка не найдена в DOM');
        
        // Вызываем клик
        btn.click();
        assert.strictEqual(scrolled, true, 'При клике не произошел скролл');
    });
}
