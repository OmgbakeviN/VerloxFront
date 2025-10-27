import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { verifyEmail, resendPin } from '../api/auth'
import { useNavigate, useSearch } from '@tanstack/react-router'

export default function Verify() {
  const search = useSearch({ from: '/verify' })
  const emailFromUrl = search?.email || ''
  const [email, setEmail] = useState(emailFromUrl)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let t
    if (cooldown > 0) t = setTimeout(() => setCooldown((c)=>c-1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      await verifyEmail({ email, code })
      setMsg({ type: 'success', text: 'Email vérifié. Vous pouvez vous connecter.' })
      setTimeout(() => navigate({ to: '/login' }), 800)
    } catch (err) {
      const data = err?.response?.data
      const text = data?.code || data?.email || data?.detail || 'Erreur.'
      setMsg({ type: 'error', text: typeof text === 'string' ? text : JSON.stringify(text) })
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (cooldown > 0) return
    setMsg(null)
    try {
      await resendPin({ email })
      setMsg({ type: 'success', text: 'Nouveau code envoyé.' })
      setCooldown(60)
    } catch (err) {
      const data = err?.response?.data
      const text = data?.email || data?.detail || 'Erreur.'
      setMsg({ type: 'error', text: typeof text === 'string' ? text : JSON.stringify(text) })
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Vérifier votre email</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Email
          <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:'100%', padding:8, marginTop:4 }} />
        </label>
        <label>
          Code (6 chiffres)
          <input type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required value={code} onChange={(e)=>setCode(e.target.value)} style={{ width:'100%', padding:8, marginTop:4, letterSpacing:4 }} />
        </label>
        <button type="submit" disabled={loading} style={{ padding:'8px 12px' }}>{loading?'Vérification…':'Vérifier'}</button>
        <button type="button" onClick={onResend} disabled={cooldown>0} style={{ padding:'6px 10px' }}>
          Renvoyer un code {cooldown>0 ? `(${cooldown})` : ''}
        </button>
        {msg && <div style={{ background: msg.type==='success'?'#e8fff0':'#ffecec', border:'1px solid #ddd', padding:8, borderRadius:8 }}>{msg.text}</div>}
      </form>
    </div>
  )
}
