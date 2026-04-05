'use client'
import { useState } from 'react'
import { useFetch, apiRequest } from '@/lib/hooks'
import type { Deck } from '@/lib/types'

const langs = [{ emoji: '🐍', name: 'Python' }, { emoji: '🗃️', name: 'SQL' }, { emoji: '🐼', name: 'Pandas' }, { emoji: '🔀', name: 'Git' }, { emoji: '📊', name: 'Power BI' }, { emoji: '🤖', name: 'NumPy' }]

export default function CriarPage() {
  const { data: decksData, loading: decksLoading } = useFetch<Deck[]>('/api/decks')
  const [input, setInput] = useState('')
  const [selectedLang, setSelectedLang] = useState(0)
  const [selectedDeck, setSelectedDeck] = useState('')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<{ description: string; code_example: string; exercise: string } | null>(null)

  const hasInput = input.trim().length > 0

  async function handleGenerate() {
    if (!input.trim()) return
    if (!selectedDeck) {
      alert('Selecione um deck de destino.')
      return
    }
    setGenerating(true)
    try {
      const result = await apiRequest('POST', '/api/ai/generate', {
        front: input.trim(),
        language: langs[selectedLang].name,
        deck: selectedDeck,
      })
      const description = result.description || ''
      const code_example = result.code_example || result.codeExample || ''
      const exercise = result.exercise || ''
      setPreview({ description, code_example, exercise })
      const card = await apiRequest('POST', '/api/cards', {
        front: result.front || input.trim(),
        language: result.language || langs[selectedLang].name,
        deck_id: selectedDeck,
        description,
        code_example,
        exercise,
        difficulty: result.difficulty || 1,
      })
      if (card && card.id) {
        window.location.href = '/cards'
      }
    } catch (e) {
      console.error('Failed to generate card', e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page active animate-up">
      <div className="topbar">
        <div><div className="page-heading">Criar Card</div><div className="page-sub">A IA gera a descrição e o exercício automaticamente.</div></div>
      </div>
      <div className="create-grid">
        <div>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Função / Método / Conceito</label>
              <input className="form-input" type="text" placeholder="ex: df.pivot_table(), CASE WHEN, *args..." value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Linguagem</label>
              <div className="lang-grid">
                {langs.map((l, i) => (
                  <div key={i} className={`lang-opt ${selectedLang === i ? 'selected' : ''}`} onClick={() => setSelectedLang(i)}>
                    <span className="emoji">{l.emoji}</span> {l.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Deck de destino</label>
              <select className="form-input" value={selectedDeck} onChange={e => setSelectedDeck(e.target.value)}>
                <option value="">Selecionar deck...</option>
                {decksLoading ? <option>Carregando...</option> : decksData?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                <option value="">+ Criar novo deck</option>
              </select>
            </div>
            <button className="btn btn-dark" style={{width:'100%',justifyContent:'center',padding:12,fontSize:14}} onClick={handleGenerate} disabled={generating || !input.trim()}>
              {generating ? '⏳ Gerando...' : '✨ Gerar com IA e salvar'}
            </button>
          </div>
        </div>
        <div>
          <div className="ai-preview">
            <div className="ai-preview-header"><div className="ai-dot"></div><span style={{fontSize:12,fontWeight:600,color:'var(--muted)'}}>Prévia gerada por IA</span></div>
            <div className="ai-preview-body">
              {preview ? (<>
                <div className="preview-section"><div className="preview-label">📖 Descrição</div><div className="preview-text">{preview.description}</div></div>
                <div className="preview-section"><div className="preview-label">💻 Exemplo de uso</div><div className="preview-code">{preview.code_example}</div></div>
                <div className="preview-section"><div className="preview-label">🎯 Exercício gerado</div><div className="preview-text" style={{background:'var(--amber-bg)',padding:12,borderRadius:8}}>{preview.exercise}</div></div>
              </>) : hasInput ? (
                <div className="preview-section" style={{opacity:0.5}}>
                  <div className="preview-label">⏳ Aguardando geração...</div>
                  <div className="preview-text">Clique em "Gerar com IA e salvar" para criar o card.</div>
                </div>
              ) : (
                <div className="preview-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><line x1="9" y1="4" x2="9" y2="20"/></svg><p>Digite uma função acima para ver a prévia.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
