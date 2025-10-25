import { useQuery } from '@tanstack/react-query'
import { fetchTrades } from '../api/trades'
import { fetchDeposits } from '../api/wallet'
import { useState } from 'react'

function fmt(dt) { return new Date(dt).toLocaleString() }

export default function History() {
  const [tab, setTab] = useState('trades') // 'trades' | 'deposits'

  const tradesQuery = useQuery({
    queryKey: ['trades','CLOSED'],
    queryFn: () => fetchTrades('CLOSED'),
    enabled: tab === 'trades',
  })

  const depositsQuery = useQuery({
    queryKey: ['deposits', 1],
    queryFn: () => fetchDeposits(1),
    enabled: tab === 'deposits',
  })

  return (
    <div>
      <h2>Historique</h2>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <button onClick={() => setTab('trades')} style={{ padding:'6px 10px', borderRadius:8, background: tab==='trades'?'#eef':'#f6f6f6' }}>Trades</button>
        <button onClick={() => setTab('deposits')} style={{ padding:'6px 10px', borderRadius:8, background: tab==='deposits'?'#eef':'#f6f6f6' }}>Dépôts</button>
      </div>

      {tab === 'trades' && (
        <>
          {tradesQuery.isLoading && <p>Chargement des trades…</p>}
          {tradesQuery.isError && <p>Erreur chargement trades.</p>}
          {tradesQuery.data && tradesQuery.data.length === 0 && <p>Aucun trade clôturé.</p>}
          <div style={{ display:'grid', gap:8 }}>
            {tradesQuery.data?.map(tr => {
              const isWin = tr.status === 'WON'
              return (
                <div key={tr.id} style={{ border:'1px solid #eee', borderLeft:`6px solid ${isWin?'#24a148':'#da1e28'}`, borderRadius:8, padding:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <strong>{tr.company_symbol} — {tr.direction}</strong>
                    <span style={{ color:isWin?'#24a148':'#da1e28' }}>{tr.status}</span>
                  </div>
                  <div style={{ display:'flex', gap:12, fontSize:13, marginTop:6, flexWrap:'wrap' }}>
                    <span>Ouvert: {fmt(tr.opened_at)}</span>
                    <span>Expiration: {fmt(tr.expires_at)}</span>
                    <span>Open: {Number(tr.open_price).toFixed(6)}</span>
                    <span>Close: {tr.close_price ? Number(tr.close_price).toFixed(6) : '-'}</span>
                    <span>PNL: <b style={{ color:isWin?'#24a148':'#da1e28' }}>{Number(tr.pnl).toLocaleString()} VC</b></span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'deposits' && (
        <>
          {depositsQuery.isLoading && <p>Chargement des dépôts…</p>}
          {depositsQuery.isError && <p>Erreur chargement dépôts.</p>}
          {depositsQuery.data && depositsQuery.data.results.length === 0 && <p>Aucun dépôt.</p>}
          <div style={{ display:'grid', gap:8 }}>
            {depositsQuery.data?.results?.map(dep => (
              <div key={dep.id} style={{ border:'1px solid #eee', borderRadius:8, padding:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <strong>Réf {dep.reference}</strong>
                  <span>{fmt(dep.created_at)}</span>
                </div>
                <div style={{ display:'flex', gap:12, fontSize:13, flexWrap:'wrap' }}>
                  <span>Opérateur: {dep.provider}</span>
                  <span>Numéro: {dep.phone_masked}</span>
                  <span>Montant: {Number(dep.amount_xaf).toLocaleString()} XAF</span>
                  <span>Crédit: <b>{Number(dep.coins_vc).toLocaleString()} VC</b></span>
                  <span>Taux: {Number(dep.rate_xaf_per_vc).toLocaleString()} XAF/VC</span>
                  <span>Statut: {dep.status}</span>
                </div>
              </div>
            ))}
          </div>
          {/* pagination simple plus tard si besoin */}
        </>
      )}
    </div>
  )
}
