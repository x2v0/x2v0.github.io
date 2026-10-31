import socket
_orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

import imaplib
import email
from email.header import decode_header
import os
import re
import json
from datetime import datetime
import email.utils

IMAP_SERVER = "imap.yandex.ru"
EMAIL_USER = "valeriy.onuchin@yandex.ru"
PASSWORD_FILE = os.path.expanduser("~/.yandex_app_password")

SEARCH_SUBJECT = "debug Android with M$"
OUTPUT_DIR = "year-archive/posts"
MANIFEST_FILE = "year-archive/posts.json"

def fetch_emails():
    if not os.path.exists(PASSWORD_FILE):
        print(f"⚠ Создайте файл {PASSWORD_FILE} с паролем.")
        return

    with open(PASSWORD_FILE, "r") as f:
        password = f.read().strip()

    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(EMAIL_USER, password)
    mail.select("inbox")

    # Ищем письма с нужной темой
    status, messages = mail.search(None, f'(SUBJECT "{SEARCH_SUBJECT}")')
    if status != "OK":
        print("Ошибка поиска.")
        return

    email_ids = messages[0].split()
    print(f"Найдено писем: {len(email_ids)}")

    posts = []
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            posts = json.load(f)

    existing_ids = [p["id"] for p in posts]

    for i, e_id in enumerate(email_ids):
        status, msg_data = mail.fetch(e_id, "(RFC822)")
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                
                # --- Извлекаем дату и время ---
                date_str = msg.get("Date")
                try:
                    date_obj = email.utils.parsedate_to_datetime(date_str)
                    date_iso = date_obj.strftime("%Y-%m-%d")
                    time_str = date_obj.strftime("%H:%M")
                except:
                    date_iso = datetime.now().strftime("%Y-%m-%d")
                    time_str = datetime.now().strftime("%H:%M")

                # --- Извлекаем отправителя ---
                from_raw = msg.get("From")
                from_name, from_addr = email.utils.parseaddr(from_raw)
                # Декодируем имя, если оно закодировано (например, =?UTF-8?B?...)
                decoded_name = ""
                for part, encoding in decode_header(from_name):
                    if isinstance(part, bytes):
                        decoded_name += part.decode(encoding or "utf-8", errors="replace")
                    else:
                        decoded_name += part
                sender_display = decoded_name or from_addr

                # --- Извлекаем тему ---
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding if encoding else "utf-8")
                
                # Чистим Re: и Aw:
                clean_subject = subject
                while True:
                    new_sub = re.sub(r'^(Re|Aw|Fwd|FW|RE|AW|FWD):\s*', '', clean_subject, flags=re.IGNORECASE)
                    if new_sub == clean_subject:
                        break
                    clean_subject = new_sub
                clean_subject = clean_subject.strip()
                # --- ID темы (для древовидной структуры) ---
                thread_id = re.sub(r'[^a-z0-9]+', '-', clean_subject.lower()).strip('-')
                if not thread_id: thread_id = 'general'

                # --- Уникальный ID ---
                msg_id = msg.get("Message-ID", "")
                safe_id = msg_id.replace("<", "").replace(">", "").replace("@", "-") if msg_id else f"{date_iso}-{time_str.replace(':','')}"

                if safe_id in existing_ids:
                    continue

                # --- Тело письма ---
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                else:
                    body = msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", errors="replace")

                cleaned_body = "\n".join([line for line in body.split("\n") if not line.strip().startswith(">")]).strip()
                
                # Превью (первые 100 символов)
                preview_text = re.sub(r'\s+', ' ', cleaned_body)[:120] + "..."

                # Красивый заголовок для блога: "Тема (От: Имя, Время)"
                display_title = f"{clean_subject} ({sender_display}, {time_str})"

                # Формируем Markdown
                md_content = f"# {clean_subject}\n\n"
                md_content += f"**От:** {from_raw}\n"
                md_content += f"**Дата:** {date_iso} {time_str}\n\n"
                md_content += "---\n\n"
                md_content += cleaned_body

                filename = f"{safe_id}.md"
                filepath = os.path.join(OUTPUT_DIR, filename)
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(md_content)

                posts.append({
                    "id": safe_id,
                    "thread_id": thread_id,
                    "title": display_title,
                    "preview": preview_text,
                    "date": date_iso,
                    "filename": filename
                })
                print(f"  ✓ Сохранено: {filename}")

    posts.sort(key=lambda x: x["date"], reverse=True)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

    print("✓ Пайплайн завершен.")
    mail.logout()

if __name__ == "__main__":
    fetch_emails()
