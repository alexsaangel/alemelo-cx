# CS Dashboard Mínimo Viável
### @alemelo_cx — Método CS Mínimo Viável

App desktop para gestão de Customer Success.
Funciona offline, dados salvos localmente.

---

## Como gerar o instalador

### Windows
1. Instale o [Node.js](https://nodejs.org) (versão 18 ou superior)
2. Clique duas vezes em `INSTALAR_E_COMPILAR.bat`
3. Aguarde — o instalador `.exe` aparece na pasta `dist-electron/`

### Mac
1. Instale o [Node.js](https://nodejs.org) (versão 18 ou superior)
2. Abra o Terminal na pasta do projeto
3. Execute: `bash instalar_e_compilar_mac.sh`
4. O arquivo `.dmg` aparece na pasta `dist-electron/`

---

## Estrutura do projeto

```
csmv-app/
├── electron/
│   ├── main.js       # Processo principal Electron
│   └── preload.js    # Bridge segura Electron ↔ React
├── src/
│   ├── App.jsx       # Dashboard completo em React
│   └── main.jsx      # Entry point
├── assets/
│   └── icon.png      # Ícone do app
├── index.html
├── vite.config.js
└── package.json
```

---

## Versões

| Versão | Conteúdo |
|--------|----------|
| Gratuita | Base de Clientes + Health Score |
| Completa (paga) | + Log + Playbook + Dashboard + Export/Import |

---

**Desenvolvido por Alexsandra Melo — @alemelo_cx**  
Método CS Mínimo Viável
