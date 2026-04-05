'use client'
import { useState, useMemo } from 'react'
import { useFetch, apiRequest } from '@/lib/hooks'
import type { Card, Deck } from '@/lib/types'

const statusLabels: Record<string, string> = {
  new: 'Novo', learning: 'Aprendendo', review: 'Revisar', dominated: 'Dominado', hard: 'Difícil',
}
const statusClasses: Record<string, string> = {
  new: 'new', learning: 'review', review: 'review', dominated: 'ok', hard: 'hard',
}
const langClasses: Record<string, string> = {
  Python: 'lp-py', SQL: 'lp-sql', Pandas: 'lp-pd', Git: 'lp-git', 'Power BI': 'lp-dax', NumPy: 'lp-np',
}

export default function CardsPage() {
  const { data: cardsData, loading: cardsLoading, refetch: refetchCards } = useFetch<Card[]>('/api/cards')
  const { data: decksData, loading: decksLoading } = useFetch<Deck[]>('/api/decks')
  const [deckFilter, setDeckFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [langFilter, setLangFilter] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return (cardsData || []).filter(c => {
      if (deckFilter && c.deck_id !== deckFilter) return false
      if (statusFilter && c.status !== statusFilter) return false
      if (langFilter && c.language !== langFilter) return false
      if (search && !c.front.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [cardsData, deckFilter, statusFilter, langFilter, search])

  const languages = useMemo(() => {
    const set = new Set((cardsData || []).map(c => c.language))
    return Array.from(set).sort()
  }, [cardsData])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await apiRequest('DELETE', `/api/cards?id=${id}`)
      refetchCards()
    } catch (e) {
      console.error('Failed to delete card', e)
    } finally {
      setDeleting(null)
    }
  }

  const deckNameMap: Record<string, string> = {}
  ;(decksData || []).forEach(d => { deckNameMap[d.id] = d.name })

  if (cardsLoading || decksLoading) {
    return (
      <div className="page active animate-up">
        <div className="topbar">
          <div><div className="page-heading">Meus Cards</div><div className="page-sub">Carregando...</div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page active animate-up">
      <div className="topbar">
        <div>
          <div className="page-heading">Meus Cards</div>
          <div className="page-sub">{cardsData?.length || 0} cards em {decksData?.length || 0} decks.</div>
        </div>
        <button className="btn btn-dark" onClick={() => window.location.href = '/criar'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Card
        </button>
      </div>
      <div className="cards-toolbar">
        <select className="filter-select" value={deckFilter} onChange={e => setDeckFilter(e.target.value)}>
          <option value="">Todos os decks</option>
          {decksData?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="filter-select" value={langFilter} onChange={e => setLangFilter(e.target.value)}>
          <option value="">Todas as linguagens</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div style={{marginLeft:'auto'}}>
          <div className="lib-search" style={{margin:0,width:220}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar card..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table className="cards-table">
          <thead><tr><th>Função / Método</th><th>Linguagem</th><th>Deck</th><th>Status</th><th>Dificuldade</th><th>Próx. revisão</th><th></th></tr></thead>
          <tbody>
            {filtered.map((c) => {
              const diffColor = c.difficulty >= 3 ? 'orange' : 'accent'
              const diffLabel = c.difficulty >= 3 ? 'Difícil' : c.difficulty >= 2 ? 'Médio' : 'Fácil'
              const nextReview = c.next_review || '—'
              const isOverdue = c.next_review && new Date(c.next_review) < new Date()
              return (
                <tr key={c.id}>
                  <td><div className="fn-cell">{c.front}</div><div className="fn-sub">{c.front_subtitle || ''}</div></td>
                  <td><div className={`lang-pill ${langClasses[c.language] || ''}`} style={{width:'auto',padding:'0 10px',borderRadius:20,fontSize:11}}>{c.language}</div></td>
                  <td style={{color:'var(--muted)',fontSize:13}}>{deckNameMap[c.deck_id] || c.deck_id}</td>
                  <td><span className={`tag tag-${statusClasses[c.status]}`}>{statusLabels[c.status]}</span></td>
                  <td>
                    <div className="diff-bar"><div className="diff-dots">
                      {[1,2,3].map(d => <div key={d} className={`diff-dot ${d <= c.difficulty ? (diffColor === 'orange' ? 'hard' : 'filled') : ''}`}></div>)}
                    </div><span style={{fontSize:11,color:`var(--${diffColor === 'orange' ? 'orange' : 'muted'})`}}>{diffLabel}</span></div>
                  </td>
                  <td style={{fontSize:12,color:isOverdue ? 'var(--orange)' : 'var(--muted)',fontWeight:isOverdue ? 600 : undefined}}>{nextReview}</td>
                  <td><div className="action-btns">
                    <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button className="icon-btn" onClick={() => handleDelete(c.id)} disabled={deleting === c.id}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  </div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>Nenhum card encontrado.</div>
        )}
      </div>
    </div>
  )
}
