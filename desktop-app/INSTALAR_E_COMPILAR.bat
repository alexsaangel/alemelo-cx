@echo off
echo ============================================
echo  CS Minimo Viavel - Compilacao Windows
echo  @alemelo_cx
echo ============================================
echo.

:: Verificar Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado.
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Instalando dependencias...
call npm install

echo.
echo [2/4] Compilando React...
call npm run build

echo.
echo [3/4] Gerando instalador Windows...
call npx electron-builder --win --x64

echo.
echo [4/4] Pronto!
echo.
echo O instalador esta em: dist-electron\
echo Procure o arquivo: "CS Minimo Viavel Setup 1.0.0.exe"
echo.
pause
