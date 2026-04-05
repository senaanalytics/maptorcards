import type { Card, Deck, ReviewHistory, DailyActivity } from './types'
import fs from 'fs'
import path from 'path'

interface LocalDB {
  cards: Card[]
  decks: Deck[]
  reviewHistory: ReviewHistory[]
  dailyActivity: DailyActivity[]
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json')

function ensureDir() {
  const dir = path.dirname(DB_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readDB(): LocalDB {
  try {
    ensureDir()
    if (!fs.existsSync(DB_FILE)) {
      const initial = seedData()
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2))
      return initial
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as LocalDB
  } catch {
    const initial = seedData()
    try {
      ensureDir()
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2))
    } catch { /* ignore */ }
    return initial
  }
}

function writeDB(data: LocalDB) {
  ensureDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function uid(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

function seedData(): LocalDB {
  const decks: Deck[] = [
    { id: uid(), name: 'Python Básico', description: 'Built-ins, estruturas, loops, funções', icon: '🐍', color: '#1D6FA4', is_official: true, user_id: null, total_cards: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), name: 'SQL Completo', description: 'SELECT, JOINs, CTEs, Window Functions', icon: '🗃️', color: '#B45309', is_official: true, user_id: null, total_cards: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), name: 'Pandas', description: 'DataFrames, merge, groupby, apply', icon: '🐼', color: '#16A34A', is_official: true, user_id: null, total_cards: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), name: 'Git & Terminal', description: 'Commits, branches, rebase, stash', icon: '🔀', color: '#EA580C', is_official: true, user_id: null, total_cards: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]

  const cards: Card[] = [
    { id: uid(), deck_id: decks[0].id, user_id: null, front: 'enumerate()', front_subtitle: 'Itera com índice', language: 'Python', description: 'Retorna um iterável de tuplas (índice, valor) para cada elemento.', code_example: 'for i, item in enumerate(lista):\n    print(i, item)', exercise: 'Use enumerate() para imprimir itens com índice.', difficulty: 1, status: 'new', next_review: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), deck_id: decks[2].id, user_id: null, front: 'df.groupby()', front_subtitle: 'Agrupa por coluna', language: 'Pandas', description: 'Agrupa dados por colunas e aplica agregações.', code_example: "df.groupby('categoria').sum()", exercise: 'Agrupe por categoria e some os valores.', difficulty: 3, status: 'hard', next_review: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), deck_id: decks[1].id, user_id: null, front: 'LEFT JOIN', front_subtitle: 'Une tabelas pela esquerda', language: 'SQL', description: 'Retorna todos os registros da tabela esquerda + correspondentes.', code_example: 'SELECT * FROM a LEFT JOIN b ON a.id = b.a_id', exercise: 'Faça um LEFT JOIN entre usuarios e pedidos.', difficulty: 2, status: 'review', next_review: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), deck_id: decks[3].id, user_id: null, front: 'git rebase', front_subtitle: 'Reorganiza commits', language: 'Git', description: 'Reaplica commits sobre outra base.', code_example: 'git rebase main', exercise: 'Rebase sua branch na main.', difficulty: 1, status: 'dominated', next_review: new Date(Date.now() + 7*86400000).toISOString().split('T')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uid(), deck_id: decks[0].id, user_id: null, front: 'list comprehension', front_subtitle: 'Lista por expressão', language: 'Python', description: 'Cria listas de forma concisa com expressões.', code_example: '[x**2 for x in range(10)]', exercise: 'Crie uma lista com quadrados de 0 a 9.', difficulty: 2, status: 'review', next_review: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]

  decks.forEach(d => {
    d.total_cards = cards.filter(c => c.deck_id === d.id).length
  })

  return { cards, decks, reviewHistory: [], dailyActivity: [] }
}

function updateDeckCardCounts(data: LocalDB) {
  data.decks.forEach(d => {
    d.total_cards = data.cards.filter(c => c.deck_id === d.id).length
  })
}

export const db = {
  getCards: () => readDB().cards,
  getCard: (id: string) => readDB().cards.find(c => c.id === id),
  createCard: (card: Omit<Card, 'id' | 'created_at' | 'updated_at'>) => {
    const data = readDB()
    const newCard: Card = { ...card, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    data.cards.unshift(newCard)
    updateDeckCardCounts(data)
    writeDB(data)
    return newCard
  },
  updateCard: (id: string, updates: Partial<Card>) => {
    const data = readDB()
    const idx = data.cards.findIndex(c => c.id === id)
    if (idx === -1) return null
    data.cards[idx] = { ...data.cards[idx], ...updates, updated_at: new Date().toISOString() }
    writeDB(data)
    return data.cards[idx]
  },
  deleteCard: (id: string) => {
    const data = readDB()
    data.cards = data.cards.filter(c => c.id !== id)
    updateDeckCardCounts(data)
    writeDB(data)
  },

  getDecks: () => {
    const data = readDB()
    updateDeckCardCounts(data)
    return data.decks
  },
  getDeck: (id: string) => readDB().decks.find(d => d.id === id),
  createDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) => {
    const data = readDB()
    const newDeck: Deck = { ...deck, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    data.decks.push(newDeck)
    writeDB(data)
    return newDeck
  },
  deleteDeck: (id: string) => {
    const data = readDB()
    data.decks = data.decks.filter(d => d.id !== id)
    data.cards = data.cards.filter(c => c.deck_id !== id)
    writeDB(data)
  },

  getReviewCards: (deckId?: string, limit = 20) => {
    const data = readDB()
    const today = new Date().toISOString().split('T')[0]
    let cards = data.cards.filter(c => c.status === 'new' || (c.next_review && c.next_review <= today))
    if (deckId) cards = cards.filter(c => c.deck_id === deckId)
    return cards.slice(0, limit)
  },
  recordReview: (cardId: string, result: 'easy' | 'medium' | 'hard') => {
    const data = readDB()
    const intervals: Record<string, number> = { easy: 4, medium: 2, hard: 1 }
    const days = intervals[result] || 1
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + days)
    data.reviewHistory.push({ id: uid(), user_id: null, card_id: cardId, result, created_at: new Date().toISOString() })
    const idx = data.cards.findIndex(c => c.id === cardId)
    if (idx !== -1) {
      data.cards[idx].next_review = nextReview.toISOString().split('T')[0]
      data.cards[idx].status = result === 'easy' ? 'dominated' : result === 'hard' ? 'hard' : 'learning'
      data.cards[idx].updated_at = new Date().toISOString()
    }
    writeDB(data)
    return { success: true, next_review: nextReview.toISOString().split('T')[0] }
  },

  getProgress: () => {
    const data = readDB()
    const total = data.cards.length
    const dominated = data.cards.filter(c => c.status === 'dominated').length
    const reviews = data.reviewHistory.length
    const streak = data.dailyActivity.length > 0 ? 7 : 0
    return {
      total_cards: total,
      dominated,
      accuracy: total > 0 ? Math.round((dominated / total) * 100) : 0,
      streak,
      total_reviews: reviews,
    }
  },

  reset: () => {
    const initial = seedData()
    writeDB(initial)
  },
}
