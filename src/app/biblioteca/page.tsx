'use client'
import { useState } from 'react'
import { useFetch, apiRequest } from '@/lib/hooks'
import type { Deck, Card } from '@/lib/types'

interface DeckWithProgress extends Deck {
  done: number
}

export default function BibliotecaPage() {
  const [tab, setTab] = useState<'oficiais' | 'meus'>('oficiais')
  const [search, setSearch] = useState('')
  const [cloning, setCloning] = useState<string | null>(null)
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const { data: decksData, loading: decksLoading, refetch: refetchDecks } = useFetch<Deck[]>('/api/decks')
  const { data: cardsData, loading: cardsLoading } = useFetch<Card[]>('/api/cards')

  const decks: DeckWithProgress[] = (decksData || []).map(deck => {
    const deckCards = (cardsData || []).filter(c => c.deck_id === deck.id)
    const done = deckCards.filter(c => c.status === 'dominated').length
    return { ...deck, done }
  })

  const filtered = decks
    .filter(d => tab === 'oficiais' ? d.is_official : !d.is_official)
    .filter(d =>
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(search.toLowerCase())
    )

  async function handleClone(deck: Deck) {
    setCloning(deck.id)
    try {
      await apiRequest('POST', '/api/decks', {
        name: `${deck.name} (cópia)`,
        description: deck.description,
        icon: deck.icon,
        color: deck.color,
        is_official: false,
        total_cards: 0,
      })
      refetchDecks()
    } catch (e) {
      console.error('Failed to clone deck', e)
    } finally {
      setCloning(null)
    }
  }

  async function handleCreateDeck() {
    if (!newDeckName.trim()) return
    setCreating(true)
    try {
      await apiRequest('POST', '/api/decks', {
        name: newDeckName.trim(),
        description: newDeckDesc.trim() || null,
        icon: '📚',
        color: '#3B82F6',
        is_official: false,
        total_cards: 0,
      })
      setNewDeckName('')
      setNewDeckDesc('')
      setShowNewDeck(false)
      refetchDecks()
    } catch (e) {
      console.error('Failed to create deck', e)
    } finally {
      setCreating(false)
    }
  }

  const langMap: Record<string, string> = {
    Python: 'deck-py', SQL: 'deck-sql', Pandas: 'deck-pd',
    Git: 'deck-git', 'Power BI': 'deck-dax',
  }
  const emojiMap: Record<string, string> = {
    Python: '🐍', SQL: '🗃️', Pandas: '🐼',
    Git: '🔀', 'Power BI': '📊',
  }

  if (decksLoading || cardsLoading) {
    return (
      <div className="page active animate-up">
        <div className="topbar">
          <div><div className="page-heading">Biblioteca</div><div className="page-sub">Carregando...</div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page active animate-up">
      <div className="topbar">
        <div>
          <div className="page-heading">Biblioteca</div>
          <div className="page-sub">Decks oficiais e seus decks pessoais.</div>
        </div>
        <button className="btn btn-dark" onClick={() => setShowNewDeck(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Deck
        </button>
      </div>
      {showNewDeck && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}} onClick={() => setShowNewDeck(false)}>
          <div className="card" style={{width:400,maxWidth:'90vw'}} onClick={e => e.stopPropagation()}>
            <div className="card-head" style={{marginBottom:16}}>
              <span className="card-title">Novo Deck</span>
              <button className="icon-btn" onClick={() => setShowNewDeck(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="form-group">
              <label className="form-label">Nome do deck</label>
              <input className="form-input" type="text" placeholder="ex: Python do Trabalho" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição (opcional)</label>
              <input className="form-input" type="text" placeholder="ex: Cards do dia a dia" value={newDeckDesc} onChange={e => setNewDeckDesc(e.target.value)} />
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button className="btn btn-light" style={{flex:1,justifyContent:'center'}} onClick={() => setShowNewDeck(false)}>Cancelar</button>
              <button className="btn btn-dark" style={{flex:1,justifyContent:'center'}} onClick={handleCreateDeck} disabled={creating || !newDeckName.trim()}>
                {creating ? 'Criando...' : 'Criar Deck'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="lib-tabs">
        <button className={`lib-tab ${tab === 'oficiais' ? 'active' : ''}`} onClick={() => setTab('oficiais')}>Oficiais</button>
        <button className={`lib-tab ${tab === 'meus' ? 'active' : ''}`} onClick={() => setTab('meus')}>Meus Decks</button>
      </div>
      <div className="lib-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Buscar decks, funções, métodos..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="deck-grid">
        {filtered.map((deck) => {
          const total = deck.total_cards
          const done = deck.done
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          const cssClass = langMap[deck.name.split(' ')[0]] || 'deck-py'
          const icon = emojiMap[deck.name.split(' ')[0]] || '📚'
          return (
            <div key={deck.id} className={`deck-card ${cssClass}`}>
              <div className="deck-icon">{icon}</div>
              <div className="deck-name">{deck.name}</div>
              <div className="deck-meta">{deck.description || ''}</div>
              <div className="deck-prog-wrap">
                <div className="prog-top"><span className="prog-count">{done} / {total} cards</span><span className="prog-count">{pct}%</span></div>
                <div className="deck-prog-bar"><div className="deck-prog-fill" style={{width:`${pct}%`,background:deck.color || '#3B82F6'}}></div></div>
              </div>
              <div className="deck-bottom">
                {deck.is_official ? (
                  <span className="official-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Oficial</span>
                ) : <span className="tag tag-ok">Pessoal</span>}
                <button className="clone-btn" disabled={cloning === deck.id} onClick={() => deck.is_official ? handleClone(deck) : null}>
                  {deck.is_official ? (
                    cloning === deck.id ? 'Clonando...' : (
                      <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Clonar</>
                    )
                  ) : '✏️ Editar'}
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:60,color:'var(--muted)'}}>
            {tab === 'meus' ? 'Nenhum deck pessoal ainda. Clone um deck oficial!' : 'Nenhum deck encontrado.'}
          </div>
        )}
      </div>
    </div>
  )
}
