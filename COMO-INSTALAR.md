# Como instalar e rodar o Método Stack

## 1. Instalar o Node.js

Acesse https://nodejs.org e baixe a versão LTS (recomendada).
Instale normalmente no Windows.

## 2. Criar o arquivo de configuração

Na pasta `metodo-stack`, copie o arquivo `.env.local.example` e renomeie para `.env.local`.

Abra o `.env.local` e preencha:

```
JWT_SECRET=coloque-uma-frase-secreta-qualquer-longa
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
ANTHROPIC_MODEL=claude-sonnet-4-5
```

Para obter a chave da Anthropic: https://console.anthropic.com/

## 3. Instalar as dependências

Abra o terminal (cmd ou PowerShell) dentro da pasta `metodo-stack` e rode:

```
npm install
```

Aguarde o download de todas as dependências (pode levar 1-2 minutos).

## 4. Rodar a ferramenta

```
npm run dev
```

Acesse no navegador: http://localhost:3000

## 5. Criar sua conta

Na primeira vez, clique em "Começar agora" e crie sua conta.
Suas respostas ficam salvas localmente no arquivo `data/metodo-stack.db`.

---

## Observação sobre o banco de dados

A ferramenta usa o `better-sqlite3`, que precisa de ferramentas de compilação nativas.
Se aparecer erro durante o `npm install`, instale as ferramentas de build do Windows:

```
npm install --global windows-build-tools
```

Ou via winget:
```
winget install Microsoft.VisualStudio.2022.BuildTools
```

---

## Para rodar em produção

```
npm run build
npm start
```
