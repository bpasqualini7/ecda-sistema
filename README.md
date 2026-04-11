# Eu, de Corpo e Alma — Central de Conteúdo
Sistema web de gestão de conteúdo digital, ideias, produtos e arquivos.

---

## 🚀 Como colocar no ar (passo a passo)

### PASSO 1 — Clonar e preparar no GitHub

1. Acesse https://github.com e crie um novo repositório chamado `ecda-sistema`
2. No seu computador, abra o terminal (ou VSCode) na pasta do projeto
3. Execute:
```bash
git init
git add .
git commit -m "primeiro commit"
git remote add origin https://github.com/SEU_USUARIO/ecda-sistema.git
git push -u origin main
```

---

### PASSO 2 — Criar projeto no Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Clique em **"Novo projeto"** → nomeie como `ECDA Sistema`
3. No menu lateral vá em **"APIs e serviços" → "Biblioteca"**
4. Ative as seguintes APIs:
   - **Google Sheets API**
   - **Google Drive API**
   - **Google People API** (para dados do usuário)

---

### PASSO 3 — Configurar OAuth 2.0

1. Em **"APIs e serviços" → "Credenciais"** clique em **"Criar credenciais" → "ID do cliente OAuth"**
2. Tipo: **Aplicativo da Web**
3. Nome: `ECDA Web`
4. Em **"URIs de redirecionamento autorizados"** adicione:
   - `http://localhost:5500` (para testes locais)
   - `https://SEU-PROJETO.vercel.app` (substitua pelo seu domínio Vercel)
5. Em **"Origens JavaScript autorizadas"** adicione as mesmas URLs
6. Copie o **Client ID** gerado (formato: `xxxxx.apps.googleusercontent.com`)

---

### PASSO 4 — Configurar o CLIENT_ID no código

Abra o arquivo `js/auth.js` e substitua na linha 12:
```javascript
CLIENT_ID: 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com',
```
pelo seu Client ID real.

---

### PASSO 5 — Criar a planilha no Google Sheets

1. Acesse https://sheets.google.com e crie uma nova planilha em branco
2. Nomeie como `ECDA - Central de Conteúdo`
3. Crie 3 abas com exatamente esses nomes:
   - `Conteudo`
   - `Ideias`
   - `Produtos`
4. Copie o ID da planilha da URL:
   - URL: `https://docs.google.com/spreadsheets/d/ESTE_ID_AQUI/edit`
   - Copie apenas a parte entre `/d/` e `/edit`

---

### PASSO 6 — Configurar o SPREADSHEET_ID no código

Abra o arquivo `js/sheets.js` e substitua na linha 12:
```javascript
SPREADSHEET_ID: 'SEU_SPREADSHEET_ID_AQUI',
```
pelo ID da sua planilha.

---

### PASSO 7 — Configurar pasta no Drive (opcional)

Se quiser que os uploads vão para uma pasta específica:
1. Crie uma pasta no Google Drive chamada `ECDA - Arquivos`
2. Abra a pasta, copie o ID da URL
3. Em `js/drive.js`, substitua:
```javascript
FOLDER_ID: '',
```
por:
```javascript
FOLDER_ID: 'ID_DA_SUA_PASTA',
```

---

### PASSO 8 — Deploy na Vercel

1. Acesse https://vercel.com e faça login com sua conta GitHub
2. Clique em **"New Project"**
3. Importe o repositório `ecda-sistema`
4. Clique em **"Deploy"** (sem alterar nada mais)
5. Anote a URL gerada (ex: `https://ecda-sistema.vercel.app`)
6. Volte ao Google Cloud Console e adicione essa URL nos URIs autorizados (Passo 3)

---

### PASSO 9 — Inicializar os headers da planilha

1. Abra seu sistema no navegador e faça login
2. Abra o console do navegador (F12 → Console)
3. Digite: `sheets.setup()` e pressione Enter
4. Isso vai criar os headers automáticos nas 3 abas

---

## 🧪 Teste local

Com o VSCode, instale a extensão **"Live Server"** e clique em **"Go Live"**.
O sistema abrirá em `http://localhost:5500`.

---

## 📁 Estrutura de arquivos

```
ecda-sistema/
├── index.html          ← Página principal
├── css/
│   └── style.css       ← Estilos
├── js/
│   ├── auth.js         ← Login Google (configure CLIENT_ID aqui)
│   ├── sheets.js       ← Google Sheets (configure SPREADSHEET_ID aqui)
│   ├── drive.js        ← Upload Drive (configure FOLDER_ID aqui)
│   └── app.js          ← Lógica principal
├── vercel.json         ← Configuração Vercel
└── README.md           ← Este arquivo
```

---

## ⚙️ Funcionalidades

- ✅ Login com Google (OAuth 2.0)
- ✅ Dashboard com estatísticas
- ✅ Gestão de Conteúdo (YouTube, Shorts, Reels, Carrossel)
- ✅ Banco de Ideias com promoção para produção
- ✅ Catálogo de Produtos (impressão 3D, artes digitais)
- ✅ Upload de arquivos para o Google Drive
- ✅ Calendário editorial
- ✅ Sincronização automática com Google Sheets
- ✅ Filtros e busca por conteúdo

---

## 💡 Dúvidas?

Abra uma conversa com o Claude e diga:
_"Estou com problema no sistema ECDA, passo X"_
