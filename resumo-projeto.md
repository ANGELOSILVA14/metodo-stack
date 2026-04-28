# Resumo do Projeto — Método Stack

## O que é

Ferramenta web que guia o usuário na construção estratégica de uma comunidade. O usuário responde 37 perguntas distribuídas em 3 Pilares e 10 Etapas (Blueprint) + 7 perguntas de contexto (Plano de Ação). Ao final, a IA gera um documento completo com Blueprint, Plano de Ação e Checklist dos primeiros 30 dias.

---

## Stack Técnica

| Tecnologia | Uso |
|---|---|
| Next.js 15.3.1 (App Router) | Framework principal |
| React 19 | Frontend |
| TypeScript | Linguagem |
| Tailwind CSS v3 | Estilização (paleta navy/gold customizada) |
| Prisma + SQLite | Banco de dados local |
| Jose | JWT para autenticação (cookies httpOnly) |
| bcryptjs | Hash de senhas |
| Anthropic SDK | Geração de documentos com IA |
| docx v8 | Geração de arquivos Word |
| Node.js v22.15.0 (portátil) | Runtime (sem instalação de admin) |

---

## Estrutura de Arquivos Principais

```
metodo-stack/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Página inicial (landing)
│   │   ├── layout.tsx                        # Layout global
│   │   ├── login/page.tsx                    # Login
│   │   ├── cadastro/page.tsx                 # Cadastro
│   │   ├── metodo/page.tsx                   # Fluxo principal das 37 perguntas
│   │   ├── plano/page.tsx                    # Página legada do Plano de Ação (separado)
│   │   ├── resultado/
│   │   │   ├── page.tsx                      # Resultado completo (Blueprint + Plano + Checklist)
│   │   │   └── blueprint/page.tsx            # Resultado só do Blueprint (legado)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── me/route.ts
│   │       ├── generate/
│   │       │   └── complete/route.ts         # Gera o documento completo (2 chamadas à Anthropic)
│   │       ├── documents/[type]/route.ts     # Busca documento salvo (blueprint/action-plan/complete)
│   │       ├── download/[type]/route.ts      # Download em Word (.docx)
│   │       └── responses/route.ts            # Salva respostas com debounce
│   ├── data/
│   │   └── questions.ts                      # Todas as perguntas (PILARES, ACTION_PLAN_QUESTIONS, ALL_IDS_COMBINED)
│   ├── lib/
│   │   ├── auth.ts                           # JWT (jose)
│   │   ├── db.ts                             # Prisma singleton
│   │   └── docx-generator.ts                 # Gerador de Word com sumário, cabeçalho e rodapé
│   └── middleware.ts                         # Proteção de rotas
├── prisma/
│   └── schema.prisma                         # Modelos: User, Response, Document
├── data/
│   └── metodo-stack.db                       # Banco SQLite (gerado automaticamente)
├── .env.local                                # JWT_SECRET, ANTHROPIC_API_KEY, ANTHROPIC_MODEL
└── iniciar.bat                               # Inicia o servidor com Node portátil
```

---

## Fluxo do Usuário

1. **Cadastro/Login** — cria conta com nome, e-mail e senha
2. **Método Stack** (`/metodo`) — responde 37 perguntas em sequência:
   - Fase intro → apresentação do método
   - Fase pilar-intro → apresentação de cada pilar
   - Fase etapa → perguntas da etapa atual (respostas salvas automaticamente com debounce de 800ms)
   - Fase action-intro → transição para o Plano de Ação
   - Fase action → 7 perguntas de contexto
   - Fase done → resumo + botão para gerar o documento
3. **Geração** — 2 chamadas à API da Anthropic em paralelo (modelo claude-sonnet-4-6):
   - Chamada 1: Blueprint + Plano de Ação (8192 tokens)
   - Chamada 2: Checklist dos 30 dias (4096 tokens)
   - Resultado unificado salvo no banco como tipo `complete`
4. **Resultado** (`/resultado`) — exibe o documento completo com renderizador de markdown inline
5. **Export** — botão "Salvar como PDF" (window.print com @media print)

---

## Banco de Dados (Prisma + SQLite)

```prisma
model User       { id, name, email (unique), passwordHash, createdAt }
model Response   { id, userId, questionId, answer, updatedAt — unique(userId, questionId) }
model Document   { id, userId, type, content, createdAt — unique(userId, type) }
```

Tipos de documento: `blueprint`, `action-plan`, `complete`

---

## Geração de Documentos (Anthropic)

**Modelo:** `claude-sonnet-4-6`  
**Arquivo:** `src/app/api/generate/complete/route.ts`

**PART1_PROMPT** gera:
- Parte 1: Blueprint completo (10 etapas em 3 Pilares + Resumo Estratégico)
- Parte 2: Plano de Ação com seções temáticas (Identidade Visual, Plataforma, Materiais, Estratégia, Cronograma semanal, Roteiro do Lançamento, Primeiros 90 Dias, Métricas, Próximos Passos)

**CHECKLIST_PROMPT** gera:
- Parte 3: Checklist dos 30 dias com formato semanal, caixinhas `☐`, orientações em itálico e indicadores `◉`

**Regras dos prompts:**
- Nunca usar travessão (—)
- Usar `:` ou `.` como alternativa
- Bullet points nas seções de ação
- Cronograma dividido por semanas numeradas (sem datas fixas)
- Número de semanas baseado no tempo disponível informado pelo usuário

---

## Exportação Word (.docx)

**Arquivo:** `src/lib/docx-generator.ts`

Para o tipo `complete`, o Word gerado inclui:
- **Sumário automático** (TableOfContents com hyperlinks, atualizado ao abrir no Word)
- **Cada parte começa em página nova** (separadores `---` viram PageBreak)
- **Cabeçalho** em todas as páginas: nome da comunidade em azul navy
- **Rodapé** em todas as páginas: nome do usuário · data de geração · "Gerado pelo Método Stack"
- Fonte Calibri, tamanho 12pt, texto justificado

---

## Renderizador de Markdown (Frontend)

Componente `MarkdownContent` inline em `resultado/page.tsx`:

| Sintaxe | Renderização |
|---|---|
| `# texto` | h1 bold navy |
| `## texto` | h2 bold com borda gold |
| `### texto` | h3 uppercase tracking |
| `---` | linha divisória |
| `**texto**` | negrito |
| `*texto*` | itálico cinza |
| `- item` | bullet com ponto dourado |
| `☐ item` | caixinha de checklist |
| `◉ texto` | bloco de indicador com borda lateral navy |

---

## Autenticação

- JWT gerado com `jose`, armazenado em cookie `httpOnly` (`ms_token`)
- Middleware protege `/metodo`, `/plano`, `/resultado` e `/resultado/*`
- Rotas `/login` e `/cadastro` redirecionam para `/metodo` se já autenticado

---

## Configuração Local

**Pré-requisitos:**
- Node.js portátil em `C:\Users\angel\node-portable\` (v22.15.0, sem instalação de admin)
- Arquivo `.env.local` com:
  ```
  JWT_SECRET=metodo-stack-angelo-silva-2024-chave-secreta
  ANTHROPIC_API_KEY=sk-ant-api03-...
  ANTHROPIC_MODEL=claude-sonnet-4-6
  ```

**Para iniciar:** clicar duas vezes em `iniciar.bat`  
**URL local:** http://localhost:3000

---

## Decisões Técnicas Relevantes

- **SQLite em vez de PostgreSQL:** para rodar localmente sem servidor de banco. Migrar para Postgres (Vercel/Neon) quando for para produção.
- **Node portátil:** instalação de Node sem privilégios de administrador via zip.
- **Prisma em vez de better-sqlite3:** evita compilação nativa (node-gyp) que falha no Windows sem Python/Visual Studio.
- **Duas chamadas à Anthropic:** o limite de 8192 tokens de saída não comporta o documento inteiro em uma chamada só.
- **PDF via window.print():** sem dependência extra — usa o diálogo de impressão do navegador com CSS @media print.
- **Sem botão Word na interface:** o download em Word está disponível via API (`/api/download/complete`) mas removido da UI. Apenas PDF exibido para o usuário final.

---

## Próximo Passo Sugerido

Deploy em produção: Vercel (frontend + API) + Neon ou PlanetScale (PostgreSQL). Requer trocar `provider = "sqlite"` por `provider = "postgresql"` no `schema.prisma` e atualizar a `DATABASE_URL` no painel da Vercel.
