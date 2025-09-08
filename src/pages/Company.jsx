import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import LiveChart from '../components/LiveChart'

export default function Company() {
  const { symbol } = useParams({ from: '/company/$symbol' })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['company', symbol],
    queryFn: async () => {
      const res = await api.get(`/companies/by-symbol/${symbol}/`)
      return res.data
    },
  })

  if (isLoading) return <p>Chargement…</p>
  if (isError) return <p>Erreur : entreprise introuvable.</p>

  return (
    <div>
      <h2>
        {data.name} <small style={{ opacity: 0.6 }}>({data.symbol})</small>
      </h2>
      <p>
        <strong>Payout:</strong> {data.payout_percent}% &nbsp;|&nbsp; <strong>Volatility:</strong> {data.volatility}
      </p>

      {/* Graph live (ticks côté serveur + polling 1s) */}
      <LiveChart companyId={data.id} windowSize={120} refreshMs={1000} />

      {/* Formulaire de trade viendra Jour 5 */}
      <div style={{ border: '1px dashed #ccc', borderRadius: 12, padding: 24, marginTop: 16 }}>
        <em>Formulaire de trade (à venir Jour 5)</em>
      </div>
    </div>
  )
}
