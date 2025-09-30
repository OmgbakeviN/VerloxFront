import { useQuery } from '@tanstack/react-query'
import { fetchTrades } from '../api/trades'

export default function History() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trades', 'CLOSED'],
    queryFn: () => fetchTrades('CLOSED'),
    refetchOnWindowFocus: true,
  })

  function fmt(dt) {
    const d = new Date(dt)
    return d.toLocaleTimeString()
  }

  if (isLoading) return <p>Chargement de l’historique…</p>
  if (isError) return <p>Erreur: impossible de charger l’historique.</p>

  return (
    <div>
      <h2>Historique</h2>
      {(!data || data.length === 0) && <p>Aucun trade clôturé.</p>}
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map(tr => {
          const isWin = tr.status === 'WON'
          return (
            <div key={tr.id} style={{ border: '1px solid #eee', borderLeft: `6px solid ${isWin ? '#24a148' : '#da1e28'}`, borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{tr.company_symbol} — {tr.direction}</strong>
                <span style={{ color: isWin ? '#24a148' : '#da1e28' }}>{tr.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, marginTop: 6, flexWrap: 'wrap' }}>
                <span>Ouvert: {fmt(tr.opened_at)}</span>
                <span>Expiration: {fmt(tr.expires_at)}</span>
                <span>Open: {Number(tr.open_price).toFixed(6)}</span>
                <span>Close: {tr.close_price ? Number(tr.close_price).toFixed(6) : '-'}</span>
                <span>PNL: <b style={{ color: isWin ? '#24a148' : '#da1e28' }}>{Number(tr.pnl).toLocaleString()} XAF</b></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
