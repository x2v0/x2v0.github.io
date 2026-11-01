#!/data/data/com.termux/files/usr/bin/bash
echo "Сборка APK через wta..."
~/w2a/bin/wta build -c wta.yaml
echo "✓ Готово! APK находится в папке build/"
