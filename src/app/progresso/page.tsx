'use client'
import { useState, useEffect, useMemo } from 'react'
import { useFetch } from '@/lib/hooks'
import type { Card, Deck } from '@/lib/types'

interface ProgressData {
  total_cards: number
  dominated: number
  accuracy: number
  streak: number
  daily_activity?: { date: string; cards_reviewed: number; correct_count: number }[]
}

export default function ProgressoPage() {
  const [heatmapCells, setHeatmapCells] = useState<string[]>([])
  const { data: progressData, loading: progressLoading } = useFetch<ProgressData>('/api/progress')
  const { data: cardsData, loading: cardsLoading } = useFetch<Card[]>('/api/cards')
  const { data: decksData, loading: decksLoading } = useFetch<Deck[]>('/api/decks')

  useEffect(() => {
    const levels = ['', 'h1', 'h2', 'h3', 'h4']
    const cells: string[] = []
    for (let i = 0; i < 182; i++) {
      const r = Math.random()
      cells.push(r > 0.7 ? levels[Math.floor(Math.random() * 4) + 1] : '')
    }
    setHeatmapCells(cells)
  }, [])

  const deckBreakdown = useMemo(() => {
    if (!decksData || !cardsData) return []
    return decksData.map(deck => {
      const deckCards = cardsData.filter(c => c.deck_id === deck.id)
      const dominated = deckCards.filter(c => c.status === 'dominated').length
      const hard = deckCards.filter(c => c.status === 'hard').length
      const review = deckCards.filter(c => c.status === 'review').length
      const learning = deckCards.filter(c => c.status === 'learning').length
      const newCards = deckCards.filter(c => c.status === 'new').length
      const total = deckCards.length || 1
      const segments: { cls: string; w: string }[] = []
      if (dominated > 0) segments.push({ cls: 'seg-ok', w: `${(dominated / total) * 100}%` })
      if (review > 0 || learning > 0) segments.push({ cls: 'seg-rev', w: `${((review + learning) / total) * 100}%` })
      if (hard > 0) segments.push({ cls: 'seg-hard', w: `${(hard / total) * 100}%` })
      if (newCards > 0) segments.push({ cls: 'seg-new', w: `${(newCards / total) * 100}%` })
      const statsParts: string[] = []
      if (dominated > 0) statsParts.push(`${dominated} dominados`)
      if (hard > 0) statsParts.push(`${hard} difíceis`)
      if (review > 0) statsParts.push(`${review} revisando`)
      if (learning > 0) statsParts.push(`${learning} aprendendo`)
      if (newCards > 0) statsParts.push(`${newCards} novos`)
      const emojiMap: Record<string, string> = { Python: '🐍', SQL: '🗃️', Pandas: '🐼', Git: '🔀', 'Power BI': '📊', NumPy: '🤖' }
      const firstWord = deck.name.split(' ')[0]
      const emoji = emojiMap[firstWord] || '📚'
      return {
        name: `${emoji} ${deck.name}`,
        stats: statsParts.length > 0 ? statsParts.join(' · ') : 'Sem cards ainda',
        segments: segments.length > 0 ? segments : [{ cls: 'seg-new', w: '100%' }],
      }
    })
  }, [decksData, cardsData])

  const totalCards = progressData?.total_cards || cardsData?.length || 0
  const dominated = progressData?.dominated || cardsData?.filter(c => c.status === 'dominated').length || 0
  const accuracy = progressData?.accuracy || 0
  const streak = progressData?.streak || 0

  if (progressLoading || cardsLoading || decksLoading) {
    return (
      <div className="page active animate-up">
        <div className="topbar"><div><div className="page-heading">Progresso</div><div className="page-sub">Carregando...</div></div></div>
      </div>
    )
  }

  return (
    <div className="page active animate-up">
      <div className="topbar"><div><div className="page-heading">Progresso</div><div className="page-sub">Seu histórico de aprendizado.</div></div></div>
      <div className="progress-grid">
        <div className="big-stat"><div className="big-stat-top"><span className="big-stat-ico">🔥</span><span className="tag tag-ok">Recorde</span></div><div className="big-stat-val">{streak}</div><div className="big-stat-lbl">Dias de sequência atual</div><div className="big-stat-bar"><div className="big-stat-fill" style={{width:'50%',background:'var(--orange)'}}></div></div></div>
        <div className="big-stat"><div className="big-stat-top"><span className="big-stat-ico">🎯</span><span className="tag tag-new">Este mês</span></div><div className="big-stat-val">{accuracy > 0 ? `${Math.round(accuracy)}%` : '—'}</div><div className="big-stat-lbl">Taxa de acerto geral</div><div className="big-stat-bar"><div className="big-stat-fill" style={{width:`${accuracy}%`,background:'var(--accent)'}}></div></div></div>
        <div className="big-stat"><div className="big-stat-top"><span className="big-stat-ico">✅</span><span className="tag tag-ok">Dominados</span></div><div className="big-stat-val">{dominated}</div><div className="big-stat-lbl">Cards dominados de {totalCards}</div><div className="big-stat-bar"><div className="big-stat-fill" style={{width:totalCards > 0 ? `${(dominated / totalCards) * 100}%` : '0%',background:'var(--green)'}}></div></div></div>
      </div>
      <div className="card" style={{marginBottom:20}}>
        <div className="card-head"><span className="card-title">Atividade — últimas 26 semanas</span></div>
        <div className="heatmap-grid">{heatmapCells.map((cls, i) => <div key={i} className={`heat-cell ${cls}`}></div>)}</div>
        <div style={{display:'flex',gap:6,alignItems:'center',marginTop:10}}>
          <span style={{fontSize:11,color:'var(--muted)'}}>Menos</span>
          <div style={{width:12,height:12,borderRadius:3,background:'var(--surface2)'}}></div>
          <div style={{width:12,height:12,borderRadius:3,background:'#BFDBFE'}}></div>
          <div style={{width:12,height:12,borderRadius:3,background:'#93C5FD'}}></div>
          <div style={{width:12,height:12,borderRadius:3,background:'#3B82F6'}}></div>
          <div style={{width:12,height:12,borderRadius:3,background:'#1D4ED8'}}></div>
          <span style={{fontSize:11,color:'var(--muted)'}}>Mais</span>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><span className="card-title">Detalhamento por deck</span></div>
        <div className="deck-breakdown">
          {deckBreakdown.map((d, i) => (
            <div key={i} className="breakdown-item">
              <div className="breakdown-top"><span className="breakdown-name">{d.name}</span><span className="breakdown-stats">{d.stats}</span></div>
              <div className="breakdown-bar">{d.segments.map((s, j) => <div key={j} className={`breakdown-seg ${s.cls}`} style={{width:s.w}}></div>)}</div>
            </div>
          ))}
          {deckBreakdown.length === 0 && (
            <div style={{textAlign:'center',padding:20,color:'var(--muted)'}}>Nenhum deck encontrado.</div>
          )}
        </div>
      </div>
    </div>
  )
}
