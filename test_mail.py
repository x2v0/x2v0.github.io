import socket
import imaplib
import os

# Принудительный IPv4
_orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

IMAP_SERVER = "imap.yandex.ru"
EMAIL_USER = "valeriy.onuchin@yandex.ru"
PASSWORD_FILE = os.path.expanduser("~/.yandex_app_password")

if not os.path.exists(PASSWORD_FILE):
    print("⚠ Файл с паролем не найден")
    exit()

with open(PASSWORD_FILE, "r") as f:
    password = f.read().strip()

print(f"Попытка подключения к {IMAP_SERVER}...")
try:
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    print("✓ Соединение установлено")
    
    print(f"Попытка входа для {EMAIL_USER}...")
    mail.login(EMAIL_USER, password)
    print("✓ Успешный вход!")
    
    mail.select("inbox")
    print("✓ Папка INBOX выбрана")
    mail.logout()
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
