#!/bin/bash
echo "============================================"
echo " CS Minimo Viavel - Compilacao Mac"
echo " @alemelo_cx"
echo "============================================"
echo ""

# Verificar Node
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js nao encontrado."
    echo "Baixe em: https://nodejs.org"
    exit 1
fi

echo "[1/4] Instalando dependencias..."
npm install

echo ""
echo "[2/4] Compilando React..."
npm run build

echo ""
echo "[3/4] Gerando instalador Mac..."
npx electron-builder --mac

echo ""
echo "[4/4] Pronto!"
echo ""
echo "O instalador esta em: dist-electron/"
echo "Procure o arquivo: CS Minimo Viavel-1.0.0.dmg"
