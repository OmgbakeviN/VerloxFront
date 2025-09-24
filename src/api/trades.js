import api from './client'

// Liste les trades par statut (OPEN/CLOSED)
export async function fetchTrades(status) {
  const res = await api.get('/trading/trades', { params: status ? { status } : {} })
  return res.data
}
