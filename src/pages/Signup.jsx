import { useState } from 'react'
import { register } from '../api/auth'
import { useNavigate } from '@tanstack/react-router'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      await register({ email, password })
      setMsg({ type: 'success', text: 'Compte créé. Code envoyé par email.' })
      // redirige vers /verify avec email en query
      navigate({ to: '/verify', search: { email } })
    } catch (err) {
      const text = err?.response?.data?.email || err?.response?.data?.detail || 'Erreur.'
      setMsg({ type: 'error', text: typeof text === 'string' ? text : JSON.stringify(text) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Créer un compte</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Email
          <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:'100%', padding:8, marginTop:4 }} />
        </label>
        <label>
          Mot de passe
          <input type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:'100%', padding:8, marginTop:4 }} />
        </label>
        <button type="submit" disabled={loading} style={{ padding:'8px 12px' }}>{loading?'Création…':'Créer le compte'}</button>
        {msg && <div style={{ background: msg.type==='success'?'#e8fff0':'#ffecec', border:'1px solid #ddd', padding:8, borderRadius:8 }}>{msg.text}</div>}
      </form>
    </div>
  )
}
