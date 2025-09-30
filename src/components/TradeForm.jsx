import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import api from '../api/client'

export default function TradeForm({ companyId, onCreated }) {
  const { fetchMe } = useAuth()
  const [direction, setDirection] = useState('UP')         // UP / DOWN
  const [stake, setStake] = useState(1000)                 // montant
  const [duration, setDuration] = useState(60)             // 60 / 300 / 900
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)                     // toast simple

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await api.post('/trading/trades/', {
        company_id: companyId,
        direction,
        stake: Number(stake),
        duration_sec: Number(duration),
      })
      setMsg({ type: 'success', text: 'Trade créé avec succès.' })

      await fetchMe()

      onCreated?.(res.data)
    } catch (err) {
      const detail = err?.response?.data
      const text = typeof detail === 'string'
        ? detail
        : detail?.detail || Object.values(detail || {}).flat().join(' | ') || 'Erreur inconnue.'
      setMsg({ type: 'error', text })
    } finally {
      setLoading(false)
      // auto-hide toast
      setTimeout(() => setMsg(null), 4000)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setDirection('UP')}
          style={{ padding: '6px 10px', background: direction==='UP' ? '#e8fff0' : '#f6f6f6', borderRadius: 8 }}
        >UP</button>
        <button
          type="button"
          onClick={() => setDirection('DOWN')}
          style={{ padding: '6px 10px', background: direction==='DOWN' ? '#ffecec' : '#f6f6f6', borderRadius: 8 }}
        >DOWN</button>
      </div>

      <label>
        Montant (XAF)
        <input
          type="number"
          min="100"
          step="100"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <label>
        Durée
        <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }}>
          <option value={60}>60 s</option>
          <option value={300}>5 min</option>
          <option value={900}>15 min</option>
        </select>
      </label>

      <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
        {loading ? 'Placement…' : 'Placer le trade'}
      </button>

      {msg && (
        <div
          style={{
            background: msg.type === 'success' ? '#e8fff0' : '#ffecec',
            border: '1px solid #ddd',
            padding: 8,
            borderRadius: 8,
          }}
        >
          {msg.text}
        </div>
      )}
    </form>
  )
}
