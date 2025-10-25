import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRate, createDeposit } from '../api/wallet'
import { useAuth } from '../auth/AuthProvider'

const PROVIDERS = [
  { value: 'ORANGE', label: 'Orange Money' },
  { value: 'MTN', label: 'MTN MoMo' },
]

// validation simple côté front (même logique que backend)
function isValidCamerounPhone(p) {
  return /^\s*6\d{8}\s*$/.test(p || '')
}

export default function Deposit() {
  const { fetchMe } = useAuth()
  const [provider, setProvider] = useState('ORANGE')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState(5000) // XAF par défaut
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Taux (XAF/VC)
  const { data: rateData, isLoading: isRateLoading, isError: isRateError } = useQuery({
    queryKey: ['wallet-rate'],
    queryFn: fetchRate,
    staleTime: 60_000,
  })

  const rate = useMemo(() => {
    const r = Number(rateData?.rate_xaf_per_vc || 100)
    return isNaN(r) ? 100 : r
  }, [rateData])

  // VC estimés (arrondi "floor" à 2 décimales, comme le backend)
  const estimatedVC = useMemo(() => {
    const coins = Math.floor(((Number(amount) || 0) / rate) * 100) / 100
    return coins.toFixed(2)
  }, [amount, rate])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValidCamerounPhone(phone)) {
      setToast({ type: 'error', text: 'Numéro invalide. Format attendu: 6XXXXXXXX' })
      return
    }
    if (!amount || Number(amount) <= 0) {
      setToast({ type: 'error', text: 'Veuillez saisir un montant XAF valide.' })
      return
    }

    setSubmitting(true)
    try {
      const dep = await createDeposit({ provider, phone: phone.trim(), amount_xaf: Number(amount) })
      setToast({
        type: 'success',
        text: `Dépôt confirmé — Réf ${dep.reference}. Crédit: ${dep.coins_vc} VC.`,
      })
      // refresh du profil (pour mettre à jour balance_vc dans le header)
      await fetchMe()
      // reset léger
      setAmount(5000)
    } catch (err) {
      const detail = err?.response?.data
      const text =
        typeof detail === 'string'
          ? detail
          : detail?.detail || Object.values(detail || {}).flat().join(' | ') || 'Erreur inconnue.'
      setToast({ type: 'error', text })
    } finally {
      setSubmitting(false)
    }
  }

  if (isRateLoading) return <p>Chargement du taux…</p>
  if (isRateError) return <p>Erreur: impossible de charger le taux.</p>

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2>Dépôt de compte</h2>
      <p style={{ opacity: 0.8 }}>Taux actuel: {rate} XAF pour 1 VC</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <label>
          Opérateur
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>

        <label>
          Numéro (Cameroun)
          <input
            type="tel"
            placeholder="6XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </label>

        <label>
          Montant (XAF)
          <input
            type="number"
            min="100"
            step="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </label>

        {/* Encadré d’aperçu VC */}
        <div style={{
          border: '1px solid #eee', borderRadius: 12, padding: 12,
          background: '#fafafa', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>Vous recevrez</span>
          <strong>{estimatedVC} VC</strong>
        </div>

        <button type="submit" disabled={submitting} style={{ padding: '10px 14px' }}>
          {submitting ? 'Traitement…' : 'Déposer'}
        </button>

        {toast && (
          <div
            role="alert"
            style={{
              background: toast.type === 'success' ? '#e8fff0' : '#ffecec',
              border: '1px solid #ddd',
              padding: 10,
              borderRadius: 10,
            }}
          >
            {toast.text}
          </div>
        )}
      </form>
    </div>
  )
}
