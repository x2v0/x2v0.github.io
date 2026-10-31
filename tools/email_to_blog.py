import socket
# --- ФИКС IPv4 ---
_orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4
# ------------------

import imaplib
import email
from email.header import decode_header
import os
import re
import json
from datetime import datetime
import email.utils
import hashlib
import html

IMAP_SERVER = "imap.yandex.ru"
EMAIL_USER = "valeriy.onuchin@yandex.ru"
PASSWORD_FILE = os.path.expanduser("~/.yandex_app_password")
SEARCH_SUBJECT = "debug Android with M$"
OUTPUT_DIR = "blog/posts"
MANIFEST_FILE = "blog/posts.json"

BANNED_WORDS = ['vpn', 'telegram', 'телеграм', 'лубянка', 'фсб', 'кгб', 'кремль', 'война', 'спецоперация', 'сво', 'нато', 'россия', 'украина', 'концлагерь', 'митинг', 'протест', 'политик', 'власть', 'госдума', 'закон', 'хуй', 'пизд', 'бля', 'еба', 'ёб', 'сук', 'муд', 'говн', 'дерьм', 'жоп', 'залуп', 'манда']

def get_anon_name(real_name):
    if not real_name: return '[Аноним]'
    parts = real_name.strip().split()
    if not parts: return '[Аноним]'
    clean_name = parts[0].lower()
    if len(clean_name) < 2: return '[Аноним]'
    
    if len(parts) >= 2 and len(parts[1]) > 1:
        return parts[0][0].upper() + '.' + parts[1][0].upper() + '.'
    else:
        return parts[0][:4].capitalize() + '.'

def get_color(name):
    hash_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    colors = ['#0288d1', '#2e7d32', '#c62828', '#f9a825', '#6a1b9a', '#00838f', '#4e342e', '#d84315']
    return colors[hash_val % len(colors)]

def censor_text(text):
    if not text: return ""
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL СКРЫТ]', text)
    for word in BANNED_WORDS:
        text = re.sub(r'(?i)\b' + re.escape(word) + r'[а-яё]*', '[ЦЕНЗУРА]', text)
    return text.strip()

def fetch_emails():
    if not os.path.exists(PASSWORD_FILE):
        print("⚠ Файл с паролем не найден")
        return

    with open(PASSWORD_FILE, "r") as f:
        password = f.read().strip()

    print(f"Подключение к {IMAP_SERVER}...")
    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, password)
        mail.select("inbox")
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return

    status, messages = mail.search(None, f'(SUBJECT "{SEARCH_SUBJECT}")')
    if status != "OK":
        print("Ошибка поиска писем.")
        return

    email_ids = messages[0].split()
    print(f"Найдено писем: {len(email_ids)}")

    posts = []
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            posts = json.load(f)

    existing_ids = [p["id"] for p in posts]
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for e_id in email_ids:
        status, msg_data = mail.fetch(e_id, "(RFC822)")
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])

                from_raw = msg.get("From")
                from_name, from_addr = email.utils.parseaddr(from_raw)
                
                # Принудительная декодировка для Outlook
                if from_name and from_name.startswith('=?'):
                    from_name_parts = decode_header(from_name)
                    decoded_name = ""
                    for part, encoding in from_name_parts:
                        if isinstance(part, bytes):
                            decoded_name += part.decode(encoding or 'utf-8', errors='replace')
                        else:
                            decoded_name += part
                    from_name = decoded_name
                
                anon_sender = get_anon_name(from_name or from_addr)
                sender_color = get_color(anon_sender)

                date_str = msg.get("Date")
                try:
                    date_obj = email.utils.parsedate_to_datetime(date_str)
                    date_iso = date_obj.strftime("%Y-%m-%d")
                    time_str = date_obj.strftime("%H:%M")
                except:
                    date_iso = datetime.now().strftime("%Y-%m-%d")
                    time_str = datetime.now().strftime("%H:%M")

                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes): subject = subject.decode(encoding if encoding else "utf-8")
                
                clean_subject = subject
                while True:
                    new_sub = re.sub(r'^(Re|Aw|Fwd|FW|RE|AW|FWD):\s*', '', clean_subject, flags=re.IGNORECASE)
                    if new_sub == clean_subject: break
                    clean_subject = new_sub
                clean_subject = censor_text(clean_subject.strip())

                msg_id = msg.get("Message-ID", "")
                safe_id = msg_id.replace("<", "").replace(">", "").replace("@", "-") if msg_id else f"{date_iso}-{time_str.replace(':','')}"

                if safe_id in existing_ids: continue

                # Извлекаем тело
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                else:
                    body = msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", errors="replace")

                # Очистка от HTML
                body = re.sub(r'<[^>]+>', '', body)
                body = html.unescape(body)

                # Разделяем на "свой текст" и "цитату"
                main_text_lines = []
                quote_lines = []
                in_quote = False

                for line in body.split("\n"):
                    stripped = line.strip()
                    if re.match(r'^On .*wrote:', stripped, re.IGNORECASE) or \
                       re.match(r'^\d{1,2} \w+ \d{4}.*пишет:', stripped, re.IGNORECASE) or \
                       re.match(r'^[\s\W]*(To|From):', stripped, re.IGNORECASE) or \
                       stripped.startswith(">"):
                        in_quote = True
                    
                    if in_quote:
                        quote_lines.append(line)
                    else:
                        main_text_lines.append(line)

                cleaned_main = "\n".join(main_text_lines).strip()
                cleaned_quote = "\n".join(quote_lines).strip()
                
                cleaned_main = censor_text(cleaned_main)
                cleaned_quote = censor_text(cleaned_quote)

                preview_text = re.sub(r'\s+', ' ', cleaned_main)[:120] + "..."
                display_title = f"{clean_subject} ({anon_sender}, {time_str})"

                md_content = f"# {clean_subject}\n\n**От:** {anon_sender}\n**Дата:** {date_iso} {time_str}\n\n---\n\n{cleaned_main}"
                
                if cleaned_quote:
                    md_content += f"\n\n<details>\n<summary>📎 Показать цитируемое письмо</summary>\n\n```text\n{cleaned_quote}\n```\n</details>"

                filename = f"{safe_id}.md"
                with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
                    f.write(md_content)

                posts.append({
                    "id": safe_id, "title": display_title, "preview": preview_text,
                    "date": date_iso, "filename": filename,
                    "thread_id": re.sub(r'[^a-z0-9]+', '-', clean_subject.lower()).strip('-') or 'general',
                    "sender_color": sender_color, "sender_name": anon_sender
                })
                print(f"  ✓ Сохранено: {filename} [{anon_sender}]")

    posts.sort(key=lambda x: x["date"], reverse=True)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        
    print(f"✓ Пайплайн завершен. Сохранено {len(posts)} писем.")
    mail.logout()

if __name__ == "__main__":
    fetch_emails()
