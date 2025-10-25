import api from './client'

// Récupère le taux (XAF par VC)
export async function fetchRate() {
  const res = await api.get('/wallet/rate/')
  return res.data // { rate_xaf_per_vc: "100.00" }
}

// Crée un dépôt simulé
export async function createDeposit({ provider, phone, amount_xaf }) {
  const res = await api.post('/wallet/deposits', { provider, phone, amount_xaf })
  return res.data
}

//historique
export async function fetchDeposits(page = 1) {
  const res = await api.get('/wallet/deposits/list', { params: { page } })
  return res.data // {count, next, previous, results:[...] }
}