#!/bin/bash
echo "Сборка APK из шаблона..."
# Предполагается, что w2a установлен в Termux (например, через go install)
w2a build -c w2a.yaml
echo "✓ Готово! APK находится в папке build/"
