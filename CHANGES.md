# MaptorCards - Resumo das Alterações

## Visão Geral

Reescrita completa do frontend do app MaptorCards para usar APIs reais em vez de dados hardcoded, com persistência em arquivo (`data/db.json`).

---

## 1. Páginas Reescritas

### `src/app/biblioteca/page.tsx`
- **Antes:** Decks hardcoded (`officialDecks`, `myDecks`)
- **Depois:**
  - `useFetch<Deck[]>('/api/decks')` para buscar decks reais
  - `useFetch<Card[]>('/api/cards')` para calcular progresso por deck
  - Busca com filtro client-side (search input controlado)
  - Botão **Novo Deck** abre modal com nome/descrição → POST `/api/decks`
  - Botão **Clonar** cria cópia com `is_official: false` → refetch
  - Loading states e empty states

### `src/app/cards/page.tsx`
- **Antes:** 5 cards hardcoded
- **Depois:**
  - `useFetch` para cards e decks
  - Filtros controlados: deck, status, linguagem (client-side)
  - Busca por nome do card (client-side)
  - DELETE → `DELETE /api/cards?id=xxx` + refetch
  - Status, dificuldade e revisão calculados dos dados reais

### `src/app/revisao/page.tsx`
- **Antes:** 3 flashcards hardcoded
- **Depois:**
  - `useFetch<Card[]>('/api/review')` para cards de revisão
  - Flashcard real: clica para revelar → mostra `description` + `code_example`
  - Easy/Medium/Hard → `POST /api/review` com `{ card_id, result }`
  - Tela de conclusão quando termina
  - Estados: loading, empty (sem cards), submitting

### `src/app/criar/page.tsx`
- **Antes:** Form sem ação, preview hardcoded
- **Depois:**
  - Deck selector populado via `useFetch<Deck[]>('/api/decks')`
  - Exige deck selecionado antes de gerar
  - "Gerar com IA" → POST `/api/ai/generate` → POST `/api/cards`
  - Preview mostra dados reais da resposta
  - Redirect para `/cards` ao salvar com sucesso

### `src/app/upload/page.tsx`
- **Antes:** Cards detectados hardcoded
- **Depois:**
  - "Analisar" → POST `/api/ai/generate` com código → retorna cards detectados
  - Checkboxes para selecionar quais salvar
  - "Salvar cards" → POST cada card para `/api/cards`
  - Loading states (analyzing, saving)

### `src/app/progresso/page.tsx`
- **Antes:** Stats hardcoded (89/147, 84%, etc.)
- **Depois:**
  - Stats de `useFetch('/api/progress')` (total_cards, dominated, accuracy, streak)
  - Deck breakdown calculado de cards + decks reais
  - Segmented bars baseados em status reais por deck
  - Heatmap mantido aleatório (como antes)

### `src/app/perfil/page.tsx`
- Sem alterações — página de configurações UI-only

---

## 2. API: `/api/ai/generate` — Banco de Dados de Funções

Substituída a resposta fake fixa por um banco de **~90 funções reais**:

| Linguagem | Quantidade | Exemplos |
|-----------|-----------|----------|
| **Python** | 30 | `enumerate()`, `zip()`, `lambda`, `list comprehension`, `decorator`, `generator`, `try/except`, `*args`, `**kwargs`, etc. |
| **SQL** | 22 | `SELECT`, `WHERE`, `LEFT JOIN`, `GROUP BY`, `HAVING`, `CASE WHEN`, `ROW_NUMBER()`, `COALESCE()`, etc. |
| **Pandas** | 20 | `df.groupby()`, `df.merge()`, `df.pivot_table()`, `df.apply()`, `df.loc[]`, `df.query()`, etc. |
| **Git** | 18 | `git init`, `git clone`, `git commit`, `git rebase`, `git stash`, `git cherry-pick`, etc. |

- Busca por match exato ou parcial no nome da função
- Fallback genérico se não encontrar
- Suporte a análise de código (detecta funções usadas no código colado)

---

## 3. Database: `src/lib/db.ts`

### Antes
- Usava `localStorage` (só funciona no cliente)
- API routes rodavam no servidor e não tinham acesso aos dados

### Depois
- **Servidor:** lê/escreve `data/db.json` via `fs` (persiste entre requests)
- **Cliente:** não acessa DB diretamente — fala só via API
- `createCard` atualiza `total_cards` do deck automaticamente
- `deleteCard` atualiza contagem do deck
- `getDecks` recalcula `total_cards` antes de retornar
- Funções: CRUD completo para cards, decks, review, progress

---

## 4. Fluxo de Dados

```
┌─────────────┐     fetch      ┌──────────────┐     read/write     ┌─────────────┐
│   Browser   │ ───────────►   │  API Routes  │ ────────────────►  │  data/db.json│
│  (useFetch) │ ◄───────────   │  (Next.js)   │ ◄────────────────  │  (fs)        │
└─────────────┘     JSON        └──────────────┘     JSON           └─────────────┘
```

- Cliente nunca toca no DB diretamente
- Tudo passa por API routes (`/api/cards`, `/api/decks`, `/api/review`, `/api/progress`, `/api/ai/generate`)
- Persistência em arquivo JSON — funciona em dev e produção

---

## 5. Hooks & Types

### `src/lib/hooks.ts` (já existia, sem mudanças)
- `useFetch<T>(url)` — fetch com loading, error, refetch
- `apiRequest(method, url, body?)` — wrapper para POST/DELETE

### `src/lib/types.ts` (já existia, sem mudanças)
- `User`, `Deck`, `Card`, `ReviewHistory`, `DailyActivity`
