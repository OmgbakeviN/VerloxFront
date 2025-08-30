// Page qui teste l'appel API /api/health via React Query
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export default function Health() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health') // appelle http://127.0.0.1:8000/api/health
      return res.data
    },
  })

  if (isLoading) return <p>Chargement…</p>
  if (isError) return <p>Erreur : impossible de joindre l’API.</p>

  return (
    <div>
      <h2>API Health</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
