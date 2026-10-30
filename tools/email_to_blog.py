import imaplib
import email
from email.header import decode_header
import os
import re
import json
from datetime import datetime

# --- НАСТРОЙКИ ---
IMAP_SERVER = "imap.yandex.ru"
EMAIL_USER = "valeriy.onuchin@yandex.ru"
# Пароль не хардкодим, читаем из переменной окружения или файла
PASSWORD_FILE = os.path.expanduser("~/.yandex_app_password")

SEARCH_SUBJECT = "debug Android with M$" # Тема, которую ищем
OUTPUT_DIR = "year-archive/posts"
MANIFEST_FILE = "year-archive/posts.json"

def clean_html(raw_html):
    # Простая очистка от тегов (если письмо в HTML)
    cleanr = re.compile('<.*?>')
    return re.sub(cleanr, '', raw_html)

def fetch_emails():
    if not os.path.exists(PASSWORD_FILE):
        print(f"⚠ Создайте файл {PASSWORD_FILE} и вставьте туда пароль приложения Яндекса.")
        return

    with open(PASSWORD_FILE, "r") as f:
        password = f.read().strip()

    # Подключаемся к почте
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(EMAIL_USER, password)
    mail.select("inbox")

    # Ищем письма с нужной темой
    # (Поиск по заголовку Subject)
    status, messages = mail.search(None, f'(SUBJECT "{SEARCH_SUBJECT}")')
    
    if status != "OK":
        print("Ошибка поиска.")
        return

    email_ids = messages[0].split()
    print(f"Найдено писем: {len(email_ids)}")

    posts = []

    # Читаем манифест, если он есть (чтобы не дублировать посты)
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            posts = json.load(f)

    existing_ids = [p["id"] for p in posts]

    for i, e_id in enumerate(email_ids):
        # Получаем заголовок письма
        status, msg_data = mail.fetch(e_id, "(RFC822)")
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                
                # Декодируем тему
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding if encoding else "utf-8")
                
                # Декодируем отправителя
                from_ = msg.get("From")
                
                # Декодируем дату
                date_str = msg.get("Date")
                try:
                    date_obj = email.utils.parsedate_to_datetime(date_str)
                    date_iso = date_obj.strftime("%Y-%m-%d")
                except:
                    date_iso = datetime.now().strftime("%Y-%m-%d")

                # Уникальный ID (используем Message-ID из заголовков, чтобы избежать дублей)
                msg_id = msg.get("Message-ID", "")
                if msg_id:
                    # Очищаем ID от угловых скобок и символа @
                    safe_id = msg_id.replace("<", "").replace(">", "").replace("@", "-")
                else:
                    # Запасной вариант, если Message-ID нет
                    safe_id = f"{date_iso}-{datetime.now().strftime('%H%M%S')}"
                
                post_id = safe_id

                if post_id in existing_ids:
                    continue # Пропускаем, если уже есть

                # Извлекаем тело письма
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                else:
                    body = msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", errors="replace")

                # Чистим текст от цитат (>) и лишних пробелов
                cleaned_body = "\n".join([line for line in body.split("\n") if not line.strip().startswith(">")])
                cleaned_body = cleaned_body.strip()

                # Формируем Markdown
                md_content = f"# {subject}\n\n"
                md_content += f"**От:** {from_}\n"
                md_content += f"**Дата:** {date_iso}\n\n"
                md_content += "---\n\n"
                md_content += cleaned_body

                # Сохраняем файл
                filename = f"{post_id}.md"
                filepath = os.path.join(OUTPUT_DIR, filename)
                
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(md_content)

                # Добавляем в манифест
                posts.append({
                    "id": post_id,
                    "title": subject,
                    "date": date_iso,
                    "filename": filename
                })
                print(f"  ✓ Сохранено: {filename}")

    # Сортируем манифест (новые сверху)
    posts.sort(key=lambda x: x["date"], reverse=True)

    # Сохраняем манифест
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

    print("✓ Пайплайн завершен. Манифест обновлен.")
    mail.logout()

if __name__ == "__main__":
    fetch_emails()
