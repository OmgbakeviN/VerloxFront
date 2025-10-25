import { useQuery } from '@tanstack/react-query'
import { fetchTrades } from '../api/trades'

// util: format mm:ss reste
function secondsLeft(iso) {
  const end = new Date(iso).getTime()
  const now = Date.now()
  const s = Math.max(0, Math.floor((end - now) / 1000))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function OpenTradesPanel() {
  // rafraîchir toutes les 2 s pour suivre les expirations
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trades', 'OPEN'],
    queryFn: () => fetchTrades('OPEN'),
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  })

  if (isLoading) return <p>Chargement des trades ouverts…</p>
  if (isError) return <p>Erreur: impossible de charger les trades ouverts.</p>

  return (
    <div>
      <h3>Trades ouverts</h3>
      {(!data || data.length === 0) && <p>Aucun trade ouvert pour l’instant.</p>}

      <div style={{ display: 'grid', gap: 8 }}>
        {data.map(tr => (
          <div key={tr.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{tr.company_symbol} — {tr.direction}</strong>
              <span>Stake: {Number(tr.stake).toLocaleString()} VC</span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, marginTop: 6 }}>
              <span>Open: {Number(tr.open_price).toFixed(6)}</span>
              <span>Expire: {new Date(tr.expires_at).toLocaleTimeString()}</span>
              <span style={{ fontWeight: 'bold' }}>⏳ {secondsLeft(tr.expires_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
