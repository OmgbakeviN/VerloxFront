import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useMemo } from 'react'

/**
 * Props:
 *  - companyId (number)
 *  - windowSize (number) ex: 120
 *  - refreshMs (number) ex: 1000
 */
export default function LiveChart({ companyId, windowSize = 120, refreshMs = 1000 }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ticks', companyId, windowSize],
    queryFn: async () => {
      const res = await api.get(`/companies/${companyId}/ticks/`, { params: { window: windowSize } })
      return res.data // [{t, price}, ...]
    },
    refetchInterval: refreshMs,   // <-- polling 1s
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  })

  const formatted = useMemo(() => {
    if (!data) return []
    // Recharts veut un tableau d'objets. On formate aussi un label temps lisible.
    return data.map(d => ({
      ...d,
      // label simple pour l'axe X (mm:ss). Tu pourras améliorer plus tard.
      label: new Date(d.t).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    }))
  }, [data])

  if (isLoading) return <p>Chargement du graphique…</p>
  if (isError) return <p>Erreur: impossible de charger les ticks.</p>

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={formatted} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
