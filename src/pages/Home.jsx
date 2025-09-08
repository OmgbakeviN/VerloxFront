import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import api from '../api/client'

// petite fonction utilitaire pour styliser la volatilité
function VolatilityBadge({ v }) {
  const style = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 12,
    background: v === 'HIGH' ? '#ffe6e6' : v === 'MID' ? '#fff6e0' : '#e8f6ff',
    border: '1px solid #ddd',
  }
  return <span style={style}>{v}</span>
}

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/companies/') // GET /api/companies/
      return res.data
    },
  })

  if (isLoading) return <p>Chargement des entreprises…</p>
  if (isError) return <p>Erreur: impossible de charger les entreprises.</p>

  return (
    <div>
      <h2>Entreprises disponibles</h2>
      {(!data || data.length === 0) && <p>Aucune entreprise active.</p>}

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {data.map((c) => (
          <Link
            key={c.id}
            to="/company/$symbol"
            params={{ symbol: c.symbol }}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 16,
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{c.name}</strong>
              <code>{c.symbol}</code>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <VolatilityBadge v={c.volatility} />
              <span style={{ fontSize: 12, opacity: 0.8 }}>Payout: {c.payout_percent}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
