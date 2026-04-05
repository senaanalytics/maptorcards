# MaptorCards

> Flashcards de programação com IA, visual bonito e revisão espaçada — by **SenaLabs**

---

## O que é

MaptorCards é uma aplicação web para estudantes e profissionais de tecnologia que querem fixar funções, métodos e conceitos de programação de forma eficiente. A ideia nasceu da frustração com o Anki: poderoso, mas feio e trabalhoso demais para criar cards.

A proposta é simples — você digita o nome de uma função, a IA gera a descrição e um exercício, e o sistema cuida do resto com revisão espaçada.

---

## O problema que resolve

Estudar programação tem um gap claro: você aprende um conceito, usa uma vez, e esquece em uma semana. O Anki resolve isso com repetição espaçada, mas criar os cards é tão chato que a maioria desiste antes de começar.

O MaptorCards elimina essa fricção:

- Você digita `enumerate()` → a IA gera descrição + exemplo + exercício automaticamente
- Decks oficiais já vêm prontos (Python, SQL, Pandas, Git, Power BI)
- No plano Premium, você cola seu próprio código e a IA detecta tudo que pode virar card

---

## Funcionalidades

### Gratuito
- Decks oficiais pré-prontos baseados em documentação real
- Clonar e personalizar cards oficiais
- Criar cards manualmente (até 30 gerados por IA por mês)
- Revisão espaçada com avaliação Fácil / Médio / Difícil
- Dashboard com streak, taxa de acerto e progresso por deck

### Premium (R$19/mês)
- **Upload de Código** — cola seu código, a IA detecta funções e gera até 300 cards/mês automaticamente
- Cards ilimitados criados manualmente
- Histórico detalhado de progresso

---

## Telas do app

| Tela | Descrição |
|---|---|
| **Dashboard** | Streak, stats gerais, revisão do dia, progresso por deck e quick add |
| **Biblioteca** | Decks oficiais e pessoais com barra de progresso e opção de clonar |
| **Meus Cards** | Tabela com filtros por deck, status, linguagem e busca |
| **Sessão de Revisão** | Flashcard interativo — frente/verso com código e exercício |
| **Criar Card** | Formulário com prévia gerada por IA em tempo real |
| **Upload de Código** | Cola código → IA lista funções detectadas → usuário confirma e salva (Premium) |
| **Progresso** | Heatmap de atividade, stats e detalhamento por deck |
| **Perfil** | Avatar, plano, configurações de notificação e aparência |

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React + Tailwind CSS |
| Hospedagem | Vercel |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| IA | Gemini 2.5 Flash (Google AI Studio) |
| Pagamentos | Stripe |

---

## Banco de dados

### Tabela `functions_library`

Substitui chamadas de IA para funções já conhecidas — economiza cota e garante qualidade consistente.

```sql
CREATE TABLE functions_library (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  language     TEXT NOT NULL,
  deck         TEXT NOT NULL,
  description  TEXT NOT NULL,
  example_code TEXT NOT NULL,
  exercise     TEXT NOT NULL,
  difficulty   TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

**Lógica de uso:** quando o usuário digita uma função, o sistema busca primeiro na `functions_library`. Se encontrar, usa os dados pré-prontos. Se não encontrar, chama a IA para gerar e opcionalmente salva o resultado.

```sql
SELECT * FROM functions_library
WHERE name = 'enumerate()' AND language = 'Python';
```

### Seed inicial

O CSV `maptorcards_functions_seed.csv` contém 30 funções pré-populadas cobrindo:

- **Python Básico** — `enumerate`, `zip`, list/dict comprehension, `lambda`, `*args/**kwargs`, `map`, `filter`, `try/except`, `with open`
- **Python Avançado** — decorators, generators
- **SQL Completo** — `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING`, `LEFT JOIN`, `INNER JOIN`, CTE, Window Functions
- **Pandas** — `head`, `info`, `describe`, `groupby`, `merge`, `pivot_table`, `fillna`, `dropna`, `apply`

---

## Modelo de negócio

**Freemium** com limitação de IA, não de funcionalidade:

- O plano Free tem acesso a tudo, mas com limite de 30 cards gerados por IA por mês
- O plano Premium amplia o limite para 300 cards/mês e libera o Upload de Código
- Os decks oficiais são sempre gratuitos — reduzem o custo de IA e melhoram o onboarding

**Por que funciona:** a diferença de experiência entre criar card por card e colar 100 linhas de código para gerar 10 cards em segundos justifica o pagamento.

---

## Concorrentes

| App | Problema |
|---|---|
| Anki | UX horrível, criação de cards manual e trabalhosa |
| Quizlet | Genérico demais, foco em vocabulário |
| Codewars / LeetCode | Desafios de código, não revisão de conceitos |
| Execute Program | O mais próximo — mas em inglês, pago e sem suporte ao stack brasileiro |

**Gap:** nenhum combina flashcard + IA geradora + conteúdo em português + foco no stack do mercado brasileiro (Python, SQL, Pandas, Power BI).

---

## Marca

**MaptorCards** faz parte do ecossistema **SenaLabs** — empresa/marca pessoal de Isaque Sena para projetos de tecnologia.

Outros projetos da SenaLabs:

- **MaptoSpace** — plataforma de vagas e carreira
- **devlog** — catálogo curado de cursos gratuitos
- **RoadmapAI** — gerador de roadmap de estudos a partir de descrições de vagas
- **brasileconomics** — biblioteca Python para acesso unificado a APIs econômicas brasileiras (BACEN, IBGE, B3)

---

## Status

> Fase de design e arquitetura — frontend prototipado, banco de dados modelado, seed inicial criado.

**Próximos passos:**
1. Configurar projeto no Supabase e importar seed
2. Criar projeto React e conectar ao Supabase
3. Implementar autenticação
4. Construir fluxo de criação de card com chamada ao Gemini
5. Implementar algoritmo de revisão espaçada
6. Integrar Stripe para o plano Premium

---

*Documentação gerada em abril de 2026.*
