'use client'
import { useState } from 'react'
import { apiRequest } from '@/lib/hooks'

interface DetectedCard {
  fn: string
  type: string
  checked: boolean
  description?: string
  code_example?: string
  exercise?: string
  language?: string
}

export default function UploadPage() {
  const [cards, setCards] = useState<DetectedCard[]>([])
  const [code, setCode] = useState('')
  const [activePill, setActivePill] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const pills = ['Python', 'SQL', 'Pandas']
  const checkedCount = cards.filter(c => c.checked).length

  function toggleCard(i: number) {
    setCards(prev => prev.map((c, idx) => idx === i ? {...c, checked: !c.checked} : c))
  }

  async function handleAnalyze() {
    if (!code.trim()) return
    setAnalyzing(true)
    try {
      const result = await apiRequest('POST', '/api/ai/generate', {
        front: 'analyze_code',
        code: code.trim(),
        language: pills[activePill],
      })
      if (result.cards && Array.isArray(result.cards)) {
        setCards(result.cards.map((c: any) => ({
          fn: c.front || c.fn,
          type: c.language ? `${c.language} · ${c.type || 'Conceito'}` : c.type || 'Conceito',
          checked: true,
          description: c.description,
          code_example: c.code_example,
          exercise: c.exercise,
          language: c.language || pills[activePill],
        })))
      } else if (result.front) {
        setCards([{
          fn: result.front,
          type: `${pills[activePill]} · Conceito`,
          checked: true,
          description: result.description,
          code_example: result.code_example,
          exercise: result.exercise,
          language: pills[activePill],
        }])
      }
    } catch (e) {
      console.error('Failed to analyze code', e)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSave() {
    const selected = cards.filter(c => c.checked)
    if (selected.length === 0) return
    setSaving(true)
    try {
      for (const card of selected) {
        await apiRequest('POST', '/api/cards', {
          front: card.fn,
          language: card.language || pills[activePill],
          description: card.description,
          code_example: card.code_example,
          exercise: card.exercise,
          difficulty: 1,
        })
      }
      setCards([])
      setCode('')
    } catch (e) {
      console.error('Failed to save cards', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page active animate-up">
      <div className="pro-banner">
        <div className="pro-banner-left">
          <div className="pro-tag">⚡ Premium</div>
          <div className="pro-title">Upload de Código</div>
          <div className="pro-sub">Cole seu código e a IA gera os cards automaticamente.</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{textAlign:'right'}}><div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginBottom:4}}>Créditos este mês</div><div style={{fontSize:24,fontWeight:800,color:'#fff',letterSpacing:'-1px'}}>247 <span style={{fontSize:14,opacity:.5}}>/ 300</span></div></div>
        </div>
      </div>
      <div className="upload-grid">
        <div>
          <div className="code-editor-wrap">
            <div className="editor-header">
              <div className="editor-lang-pills">{pills.map((p, i) => <button key={i} className={`editor-pill ${activePill === i ? 'active' : ''}`} onClick={() => setActivePill(i)}>{p}</button>)}</div>
              <span style={{fontSize:11,color:'var(--muted)'}}>máx. 150 linhas</span>
            </div>
            <textarea className="code-textarea" placeholder="Cole seu código aqui..." value={code} onChange={e => setCode(e.target.value)} />
          </div>
          <button className="gen-btn" onClick={handleAnalyze} disabled={analyzing || !code.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            {analyzing ? 'Analisando...' : 'Analisar e gerar cards'}
          </button>
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Cards detectados</span><span style={{fontSize:12,color:'var(--muted)'}}>{cards.length} encontrados</span></div>
          <div className="generated-list">
            {cards.length === 0 && (
              <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>Cole código e clique em analisar para detectar cards.</div>
            )}
            {cards.map((c, i) => (
              <div key={i} className="gen-item">
                <div className={`gen-checkbox ${c.checked ? 'checked' : ''}`} onClick={() => toggleCard(i)}></div>
                <div><div className="gen-fn">{c.fn}</div><div className="gen-type" style={{fontSize:11,color:'var(--muted)'}}>{c.type}</div></div>
              </div>
            ))}
          </div>
          {cards.length > 0 && (
            <>
              <div style={{marginTop:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,color:'var(--muted)'}}>{checkedCount} de {cards.length} selecionados</span>
                <span style={{fontSize:12,color:'var(--muted)'}}>−{checkedCount} créditos</span>
              </div>
              <button className="save-cards-btn" onClick={handleSave} disabled={saving || checkedCount === 0}>
                {saving ? '💾 Salvando...' : `💾 Salvar ${checkedCount} cards selecionados`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
