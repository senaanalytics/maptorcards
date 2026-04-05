'use client'
import { useState } from 'react'

export default function PerfilPage() {
  const [toggles, setToggles] = useState({ dailyReminder: true, streakAlert: true, weeklyReport: false, darkTheme: false, monoFont: true })
  function toggle(key: keyof typeof toggles) { setToggles(prev => ({ ...prev, [key]: !prev[key] })) }

  return (
    <div className="page active animate-up">
      <div className="topbar"><div><div className="page-heading">Perfil</div><div className="page-sub">Suas configurações e estatísticas.</div></div></div>
      <div className="profile-grid">
        <div>
          <div className="profile-card">
            <div className="profile-ava">IS</div>
            <div className="profile-name">Isaque Sena</div>
            <div className="profile-email">isaque@sena.dev</div>
            <div className="plan-badge">🆓 Plano Free</div>
            <button className="upgrade-btn">⚡ Fazer upgrade — R$19/mês</button>
            <div className="profile-stats">
              <div className="profile-stat"><div className="ps-val">147</div><div className="ps-lbl">Cards totais</div></div>
              <div className="profile-stat"><div className="ps-val">7</div><div className="ps-lbl">Dias seguidos</div></div>
              <div className="profile-stat"><div className="ps-val">84%</div><div className="ps-lbl">Acertos</div></div>
              <div className="profile-stat"><div className="ps-val">89</div><div className="ps-lbl">Dominados</div></div>
            </div>
          </div>
          <div style={{height:16}}></div>
          <div className="card">
            <div className="card-title" style={{marginBottom:14}}>Linguagens estudadas</div>
            <div className="langs-used">
              <div className="lang-used-tag"><div className="dot-indicator" style={{background:'#1D6FA4'}}></div>Python</div>
              <div className="lang-used-tag"><div className="dot-indicator" style={{background:'var(--amber)'}}></div>SQL</div>
              <div className="lang-used-tag"><div className="dot-indicator" style={{background:'var(--green)'}}></div>Pandas</div>
              <div className="lang-used-tag"><div className="dot-indicator" style={{background:'var(--orange)'}}></div>Git</div>
            </div>
          </div>
        </div>
        <div className="profile-right">
          <div className="card">
            <div className="settings-group">
              <div className="settings-title">Notificações</div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name">Lembrete diário</div><div className="settings-item-desc">Avisar quando tiver cards pra revisar</div></div><div className={`toggle ${toggles.dailyReminder ? 'on' : ''}`} onClick={() => toggle('dailyReminder')}></div></div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name">Alerta de streak</div><div className="settings-item-desc">Avisar antes de perder a sequência</div></div><div className={`toggle ${toggles.streakAlert ? 'on' : ''}`} onClick={() => toggle('streakAlert')}></div></div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name">Relatório semanal</div><div className="settings-item-desc">Resumo do progresso por email</div></div><div className={`toggle ${toggles.weeklyReport ? 'on' : ''}`} onClick={() => toggle('weeklyReport')}></div></div>
            </div>
            <div className="settings-group">
              <div className="settings-title">Aparência</div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name">Tema escuro</div><div className="settings-item-desc">Alternar entre claro e escuro</div></div><div className={`toggle ${toggles.darkTheme ? 'on' : ''}`} onClick={() => toggle('darkTheme')}></div></div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name">Fonte monoespaçada</div><div className="settings-item-desc">Usar JetBrains Mono nos cards</div></div><div className={`toggle ${toggles.monoFont ? 'on' : ''}`} onClick={() => toggle('monoFont')}></div></div>
            </div>
            <div className="settings-group">
              <div className="settings-title">Conta</div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name">Alterar senha</div></div><button className="btn btn-light" style={{padding:'6px 12px',fontSize:12}}>Alterar</button></div>
              <div className="settings-item"><div className="settings-item-left"><div className="settings-item-name" style={{color:'var(--orange)'}}>Deletar conta</div><div className="settings-item-desc">Ação irreversível</div></div><button className="btn" style={{padding:'6px 12px',fontSize:12,background:'var(--orange-bg)',color:'var(--orange)',border:'none'}}>Deletar</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
