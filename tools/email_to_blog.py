import imaplib
import email
from email.header import decode_header
import os
import re
import json
from datetime import datetime
import email.utils
import hashlib

IMAP_SERVER = "imap.yandex.ru"
EMAIL_USER = "valeriy.onuchin@yandex.ru"
PASSWORD_FILE = os.path.expanduser("~/.yandex_app_password")
SEARCH_SUBJECT = "debug Android with M$"
MAX_THREAD_DEPTH = 3  # Оставлять только последние N писем в каждой теме
OUTPUT_DIR = "blog/posts"
MANIFEST_FILE = "blog/posts.json"

# --- СЛОВАРИ ЦЕНЗУРЫ ---
# Политика (жесткий блок)
BANNED_POLITICS = ['путин', 'навальный', 'лубянка', 'фсб', 'кгб', 'кремль', 'война', 'спецоперация', 'сво', 'нато', 'россия', 'украина', 'концлагерь', 'митинг', 'протест', 'политик', 'власть', 'госдума', 'закон']
# Мат и ругань (базовый список, можно расширять)
BANNED_PROFANITY = ['хуй', 'хуя', 'пизд', 'бля', 'еба', 'ебал', 'ебан', 'ёб', 'сук', 'муд', 'говн', 'дерьм', 'жоп', 'залуп', 'манда']
# Технологии, которые нельзя светить (VPN, TG)
BANNED_TECH = ['vpn', 'телеграм', 'telegram', 'тор', 'tor', 'onion']

# База участников (корень имени -> псевдоним)
PARTICIPANTS = {}

def get_anon_name(real_name):
    """Анонимизирует имя: Вася -> [Участник 1]"""
    if not real_name: return '[Участник]'
    # Берем первое слово
    clean_name = real_name.strip().split()[0].lower()
    if len(clean_name) < 2: return '[Участник]'
    
    # Если имя уже известно
    for base, fake in PARTICIPANTS.items():
        if clean_name.startswith(base): return fake
        
    # Если новое — генерируем псевдоним
    new_id = len(PARTICIPANTS) + 1
    fake_name = f'[Участник {new_id}]'
    
    # Корень для поиска падежей (Вася -> Вас, Валерий -> Валер)
    base = clean_name[:-1] if clean_name[-1] in 'яаий' else clean_name
    PARTICIPANTS[base] = fake_name
    return fake_name

def get_color(name):
    """Генерирует уникальный цвет для аватарки/фона по имени"""
    hash_val = int(hashlib.md5(name.encode()).hexdigest(), 16)
    colors = ['#0288d1', '#2e7d32', '#c62828', '#f9a825', '#6a1b9a', '#00838f', '#4e342e', '#d84315']
    return colors[hash_val % len(colors)]

def censor_text(text):
    if not text: return ""
    
    # 1. Вырезаем email-адреса
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL СКРЫТ]', text)
    
    # 2. Вырезаем ссылки
    text = re.sub(r'https?://\S+', '[ССЫЛКА]', text)
    
    # 3. Цензура политики и ругани
    for word in BANNED_POLITICS + BANNED_PROFANITY + BANNED_TECH:
        # Ищем как отдельные слова, так и внутри слов (для мата)
        text = re.sub(r'(?i)' + re.escape(word) + r'[а-яё]*', '[ЦЕНЗУРА]', text)
        
    # 4. Анонимизация имен
    for base, fake in PARTICIPANTS.items():
        text = re.sub(r'(?i)\b' + re.escape(base) + r'[а-яё]*\b', fake, text)
        
    # Убираем повторяющиеся [ЦЕНЗУРА]
    text = re.sub(r'(\[ЦЕНЗУРА\]\s*)+', '[ЦЕНЗУРА] ', text)
    
    return text.strip()

def fetch_emails():
    if not os.path.exists(PASSWORD_FILE):
        print(f"⚠ Создайте файл {PASSWORD_FILE} с паролем.")
        return

    with open(PASSWORD_FILE, "r") as f:
        password = f.read().strip()

    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    try:
        mail.login(EMAIL_USER, password)
    except Exception as e:
        print(f"Ошибка входа: {e}")
        return
        
    mail.select("inbox")
    status, messages = mail.search(None, f'(SUBJECT "{SEARCH_SUBJECT}")')
    if status != "OK": return

    email_ids = messages[0].split()
    print(f"Найдено писем: {len(email_ids)}")

    posts = []
    if os.path.exists(MANIFEST_FILE):
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            posts = json.load(f)

    existing_ids = [p["id"] for p in posts]
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for i, e_id in enumerate(email_ids):
        status, msg_data = mail.fetch(e_id, "(RFC822)")
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])

                # Отправитель
                from_raw = msg.get("From")
                from_name, from_addr = email.utils.parseaddr(from_raw)
                
                # Анонимизируем отправителя
                anon_sender = get_anon_name(from_name or from_addr)
                sender_color = get_color(anon_sender)

                # Дата
                date_str = msg.get("Date")
                try:
                    date_obj = email.utils.parsedate_to_datetime(date_str)
                    date_iso = date_obj.strftime("%Y-%m-%d")
                    time_str = date_obj.strftime("%H:%M")
                except:
                    date_iso = datetime.now().strftime("%Y-%m-%d")
                    time_str = datetime.now().strftime("%H:%M")

                # Тема
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding if encoding else "utf-8")
                
                clean_subject = subject
                while True:
                    new_sub = re.sub(r'^(Re|Aw|Fwd|FW|RE|AW|FWD):\s*', '', clean_subject, flags=re.IGNORECASE)
                    if new_sub == clean_subject: break
                    clean_subject = new_sub
                clean_subject = censor_text(clean_subject.strip())

                # ID
                msg_id = msg.get("Message-ID", "")
                safe_id = msg_id.replace("<", "").replace(">", "").replace("@", "-") if msg_id else f"{date_iso}-{time_str.replace(':','')}"

                if safe_id in existing_ids: continue

                # Тело
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                else:
                    body = msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", errors="replace")

                # Чистка цитат
                cleaned_body = "\n".join([line for line in body.split("\n") if not line.strip().startswith(">")]).strip()
                
                # ПРИМЕНЯЕМ ЦЕНЗУРУ
                cleaned_body = censor_text(cleaned_body)

                # ФИЛЬТР "ТОЛЬКО ПО ДЕЛУ" (если текста меньше 50 символов — пропускаем)
                text_only = re.sub(r'\[.*?\]', '', cleaned_body).strip()
                if len(text_only) < 50:
                    print(f"  ✕ Пропущено письмо от {anon_sender} (слишком короткое после цензуры)")
                    continue

                preview_text = re.sub(r'\s+', ' ', cleaned_body)[:120] + "..."
                display_title = f"[ЧЕРНОВИК] {clean_subject} ({anon_sender}, {time_str})"

                # Формируем Markdown
                md_content = f"# {clean_subject}\n\n"
                md_content += f"**От:** {anon_sender}\n"
                md_content += f"**Дата:** {date_iso} {time_str}\n\n"
                md_content += "---\n\n"
                md_content += cleaned_body

                filename = f"{safe_id}.md"
                with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
                    f.write(md_content)

                posts.append({
                    "id": safe_id,
                    "title": display_title,
                    "preview": preview_text,
                    "date": date_iso,
                    "filename": filename,
                    "thread_id": re.sub(r'[^a-z0-9]+', '-', clean_subject.lower()).strip('-') or 'general',
                    "sender_color": sender_color,
                    "sender_name": anon_sender
                })
                print(f"  ✓ Сохранено: {filename} [{anon_sender}]")

    # --- ОБРЕЗКА ПО ГЛУБИНЕ (Только последние N писем в теме) ---
    print(f"\n=== Обрезка по глубине (оставляем по {MAX_THREAD_DEPTH} писем) ===")
    
    # Сортируем ВСЕ посты по дате (новые сверху), чтобы взять самые свежие
    posts.sort(key=lambda x: x["date"], reverse=True)
    
    thread_counts = {}
    final_posts = []
    posts_to_delete = []
    
    for post in posts:
        tid = post.get("thread_id", "general")
        
        # Если тема новая - инициализируем счетчик
        if tid not in thread_counts:
            thread_counts[tid] = 0
            
        thread_counts[tid] += 1
        
        # Если не превышает лимит - оставляем
        if thread_counts[tid] <= MAX_THREAD_DEPTH:
            final_posts.append(post)
        else:
            # Иначе - помечаем файл на удаление
            posts_to_delete.append(post["filename"])
            
    # Удаляем старые файлы с диска
    for fname in posts_to_delete:
        filepath = os.path.join(OUTPUT_DIR, fname)
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"  ✕ Удален старый пост: {fname} (превышена глубина {MAX_THREAD_DEPTH})")

    # Сохраняем очищенный манифест
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(final_posts, f, ensure_ascii=False, indent=2)

    print(f"✓ Пайплайн завершен. Оставлено {len(final_posts)} писем (по {MAX_THREAD_DEPTH} на тему).")
    mail.logout()

if __name__ == "__main__":
    fetch_emails()
