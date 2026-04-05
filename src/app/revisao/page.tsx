'use client'
import { useState } from 'react'
import { useFetch, apiRequest } from '@/lib/hooks'
import type { Card } from '@/lib/types'

const langEmojis: Record<string, string> = {
  Python: '🐍', SQL: '🗃️', Pandas: '🐼', Git: '🔀', 'Power BI': '📊', NumPy: '🤖',
}
const langClasses: Record<string, string> = {
  Python: 'lp-py', SQL: 'lp-sql', Pandas: 'lp-pd', Git: 'lp-git', 'Power BI': 'lp-dax', NumPy: 'lp-np',
}

export default function RevisaoPage() {
  const { data: reviewCards, loading, refetch: refetchReview } = useFetch<Card[]>('/api/review')
  const [current, setCurrent] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const total = reviewCards?.length || 0
  const card = reviewCards?.[current]

  function reveal() { if (!revealed) setRevealed(true) }

  async function next(result: 'easy' | 'medium' | 'hard') {
    if (!card) return
    setSubmitting(true)
    try {
      await apiRequest('POST', '/api/review', { card_id: card.id, result })
    } catch (e) {
      console.error('Failed to submit review', e)
    } finally {
      setSubmitting(false)
    }
    if (current + 1 >= total) {
      setDone(true)
    } else {
      setCurrent(prev => prev + 1)
      setRevealed(false)
    }
  }

  async function restart() {
    setCurrent(0)
    setRevealed(false)
    setDone(false)
    refetchReview()
  }

  if (loading) {
    return (
      <div className="page active animate-up">
        <div className="topbar">
          <div><div className="page-heading">Sessão de Revisão</div><div className="page-sub">Carregando cards...</div></div>
        </div>
      </div>
    )
  }

  if (!reviewCards || total === 0) {
    return (
      <div className="page active animate-up">
        <div className="topbar">
          <div><div className="page-heading">Sessão de Revisão</div></div>
        </div>
        <div className="review-wrap" style={{textAlign:'center',paddingTop:80}}>
          <div style={{fontSize:48,marginBottom:16}}>📚</div>
          <div className="page-heading" style={{marginBottom:8}}>Nenhum card para revisar!</div>
          <div className="page-sub" style={{marginBottom:24}}>Volte mais tarde ou crie novos cards.</div>
          <button className="btn btn-dark" onClick={() => window.location.href = '/dashboard'}>Ir para o Dashboard</button>
        </div>
      </div>
    )
  }

  if (done) return (
    <div className="page active animate-up">
      <div className="review-wrap" style={{textAlign:'center',paddingTop:80}}>
        <div style={{fontSize:48,marginBottom:16}}>🎉</div>
        <div className="page-heading" style={{marginBottom:8}}>Revisão completa!</div>
        <div className="page-sub" style={{marginBottom:24}}>Você revisou {total} cards.</div>
        <button className="btn btn-dark" onClick={restart}>Revisar novamente</button>
      </div>
    </div>
  )

  if (!card) return null

  const emoji = langEmojis[card.language] || '📚'
  const langClass = langClasses[card.language] || ''

  return (
    <div className="page active animate-up">
      <div className="topbar">
        <div><div className="page-heading">Sessão de Revisão</div><div className="page-sub">{card.language} · {total - current} cards restantes</div></div>
        <button className="btn btn-light" onClick={() => window.location.href = '/dashboard'}>✕ Encerrar sessão</button>
      </div>
      <div className="review-wrap">
        <div className="review-progress">
          <div className="rev-bar"><div className="rev-bar-fill" style={{width:`${((current + (revealed ? 1 : 0)) / total) * 100}%`}}></div></div>
          <span className="rev-count">{current + (revealed ? 1 : 0)} / {total}</span>
        </div>
        <div className="flashcard" onClick={reveal} style={revealed ? {cursor:'default'} : {}}>
          <div className={`fc-lang ${langClass}`} style={{borderRadius:20,padding:'5px 14px'}}>{emoji} {card.language}</div>
          <div className="fc-fn">{card.front}</div>
          <div className="fc-back" style={{display: revealed ? 'block' : 'none'}}>
            {card.description && <div className="fc-desc">{card.description}</div>}
            {card.code_example && <div className="fc-code">{card.code_example}</div>}
          </div>
          {!revealed && <div className="fc-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Clique para revelar</div>}
        </div>
        {revealed && (
          <div className="diff-btns">
            <button className="diff-btn btn-easy" onClick={() => next('easy')} disabled={submitting}>😊 Fácil<span>Ver em 4 dias</span></button>
            <button className="diff-btn btn-medium" onClick={() => next('medium')} disabled={submitting}>🤔 Médio<span>Ver em 2 dias</span></button>
            <button className="diff-btn btn-hard2" onClick={() => next('hard')} disabled={submitting}>😰 Difícil<span>Ver amanhã</span></button>
          </div>
        )}
      </div>
    </div>
  )
}
