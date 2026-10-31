import json
import pathlib

manifest_path = pathlib.Path('blog/posts.json')
posts = json.loads(manifest_path.read_text(encoding='utf-8'))

print("\n=== СПИСОК СТАТЕЙ ===")
for i, p in enumerate(posts):
    print(f"{i+1}. {p['title']} ({p['date']})")

choice = input("\nВведите номер статьи для удаления (или 0 для отмены): ")
if choice.isdigit():
    idx = int(choice) - 1
    if 0 <= idx < len(posts):
        post = posts.pop(idx)
        
        # Удаляем файл .md
        md_file = pathlib.Path('blog/posts') / post['filename']
        if md_file.exists():
            md_file.unlink()
            print(f"✓ Файл {post['filename']} удален.")
        
        # Сохраняем обновленный манифест
        manifest_path.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f"✓ Статья '{post['title']}' удалена из списка.")
    else:
        print("Неверный номер.")
