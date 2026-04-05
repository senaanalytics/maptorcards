'use client'

import { useState } from 'react'
import { useFetch, apiRequest } from '@/lib/hooks'
import type { Card, Deck } from '@/lib/types'

export default function DashboardPage() {
  const { data: cards, loading: cardsLoading, refetch: refetchCards } = useFetch<Card[]>('/api/cards')
  const { data: decks } = useFetch<Deck[]>('/api/decks')
  const [quickInput, setQuickInput] = useState('')

  const totalCards = cards?.length || 0
  const dominated = cards?.filter(c => c.status === 'dominated').length || 0
  const today = new Date().toISOString().split('T')[0]
  const toReview = cards?.filter(c => c.status === 'new' || (c.next_review && c.next_review <= today)).length || 0
  const accuracy = totalCards > 0 ? Math.round((dominated / totalCards) * 100) : 84
  const streak = 7

  const reviewList = cards?.filter(c => c.status === 'new' || (c.next_review && c.next_review <= today)).slice(0, 5) || []

  const deckProgress = decks?.slice(0, 4).map(d => {
    const deckCards = cards?.filter(c => c.deck_id === d.id) || []
    const done = deckCards.filter(c => c.status === 'dominated').length
    return { name: d.icon ? `${d.icon} ${d.name}` : d.name, count: `${done}/${d.total_cards}`, pct: d.total_cards > 0 ? Math.round((done / d.total_cards) * 100) : 0, color: d.color || '#2563EB' }
  }) || []

  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
  const langMap: Record<string, string> = { python: 'py', sql: 'sql', pandas: 'pd', git: 'git', dax: 'dax' }
  const statusMap: Record<string, { tag: string; type: string }> = {
    new: { tag: 'Novo', type: 'new' },
    review: { tag: 'Revisar', type: 'review' },
    hard: { tag: 'Difícil', type: 'hard' },
    dominated: { tag: 'Dominado', type: 'ok' },
    learning: { tag: 'Aprendendo', type: 'new' },
  }

  async function handleQuickAdd() {
    if (!quickInput.trim()) return
    try {
      await apiRequest('POST', '/api/cards', {
        front: quickInput.trim(),
        front_subtitle: 'Adicionado rápido',
        language: 'python',
        description: 'Gerado automaticamente',
        code_example: '',
        exercise: '',
        difficulty: 1,
        deck_id: decks?.[0]?.id,
      })
      setQuickInput('')
      refetchCards()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="page active animate-up">
      <div className="topbar">
        <div>
          <div className="page-heading">Bom dia, Isaque 👋</div>
          <div className="page-sub">Você tem {toReview} cards para revisar hoje.</div>
        </div>
        <button className="btn btn-dark" onClick={() => window.location.href = '/criar'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Card
        </button>
      </div>

      <div className="streak">
        <div className="streak-left">
          <span className="streak-emoji">🔥</span>
          <div><div className="s-num">{streak}</div><div className="s-label">dias de sequência</div></div>
        </div>
        <div className="streak-dots">
          {days.map((d, i) => <div key={i} className={`dot ${i < 6 ? 'done' : 'today'}`}>{d}</div>)}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-ico" style={{background:'var(--accent-bg)'}}>📚</div>
          <div className="stat-val">{totalCards}</div><div className="stat-lbl">Cards totais</div>
          <div className="stat-delta up">↑ +12 essa semana</div>
        </div>
        <div className="stat">
          <div className="stat-ico" style={{background:'var(--green-bg)'}}>✅</div>
          <div className="stat-val">{dominated}</div><div className="stat-lbl">Dominados</div>
          <div className="stat-delta up">↑ {totalCards > 0 ? Math.round((dominated / totalCards) * 100) : 0}% do total</div>
        </div>
        <div className="stat">
          <div className="stat-ico" style={{background:'var(--amber-bg)'}}>⏳</div>
          <div className="stat-val">{toReview}</div><div className="stat-lbl">Para revisar hoje</div>
          <div className="stat-delta down">↓ {toReview > 5 ? toReview - 5 : 0} atrasados</div>
        </div>
        <div className="stat">
          <div className="stat-ico" style={{background:'var(--orange-bg)'}}>🎯</div>
          <div className="stat-val">{accuracy}%</div><div className="stat-lbl">Taxa de acerto</div>
          <div className="stat-delta up">↑ +3% vs semana passada</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Revisão de hoje</span>
            <span className="card-link" onClick={() => window.location.href = '/revisao'}>Ver todos →</span>
          </div>
          {cardsLoading ? (
            <div style={{padding:20,color:'var(--muted)'}}>Carregando...</div>
          ) : reviewList.length === 0 ? (
            <div style={{padding:20,color:'var(--muted)',textAlign:'center'}}>Nenhum card para revisar 🎉</div>
          ) : (
            reviewList.map((c, i) => {
              const st = statusMap[c.status] || { tag: c.status, type: 'new' }
              return (
                <div key={c.id || i} className="review-item">
                  <div className="ri-left">
                    <div className={`lang-pill lp-${langMap[c.language] || 'py'}`}>{langMap[c.language] || 'py'}</div>
                    <div><div className="ri-fn">{c.front}</div><div className="ri-deck">{c.front_subtitle || ''}</div></div>
                  </div>
                  <span className={`tag tag-${st.type}`}>{st.tag}</span>
                </div>
              )
            })
          )}
          <button className="btn-start" onClick={() => window.location.href = '/revisao'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Iniciar revisão — {toReview} cards
          </button>
        </div>

        <div className="right-col">
          <div className="card">
            <div className="card-head">
              <span className="card-title">Progresso por deck</span>
              <span className="card-link" onClick={() => window.location.href = '/progresso'}>Ver tudo →</span>
            </div>
            {deckProgress.length === 0 ? (
              <div style={{color:'var(--muted)'}}>Nenhum deck ainda</div>
            ) : (
              <div className="prog-list">
                {deckProgress.map((d, i) => (
                  <div key={i}>
                    <div className="prog-top"><span className="prog-name">{d.name}</span><span className="prog-count">{d.count}</span></div>
                    <div className="prog-bar"><div className="prog-fill" style={{width:`${d.pct}%`,background:d.color}}></div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="quick">
            <div className="quick-title">Adicionar card rápido</div>
            <div className="quick-sub">Digite uma função ou método</div>
            <input className="quick-input" type="text" placeholder="ex: dict.get()  |  HAVING  |  lambda" value={quickInput} onChange={e => setQuickInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
            <button className="quick-btn" onClick={handleQuickAdd}>✨ Gerar com IA</button>
          </div>
        </div>
      </div>
    </div>
  )
}
