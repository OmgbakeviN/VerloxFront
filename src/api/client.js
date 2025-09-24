import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/token'

// Instance axios centralisée
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
})

// --- Intercepteur de requête: ajoute Authorization si access token présent ---
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Gestion du refresh avec file d’attente pour les 401 concurrents ---
let isRefreshing = false
let pendingRequests = [] // fonctions (newToken) => Promise.resolve(...retry...)

function subscribeTokenRefresh(cb) {
  pendingRequests.push(cb)
}
function onRefreshed(newAccess) {
  pendingRequests.forEach((cb) => cb(newAccess))
  pendingRequests = []
}

// Intercepteur de réponse: si 401 -> tenter /auth/refresh puis rejouer la requête
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    // Si pas 401 ou si déjà tenté un refresh sur cette requête, rejette
    if (error?.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Si pas de refresh token -> logout direct
    const refresh = getRefreshToken()
    if (!refresh) {
      clearTokens()
      return Promise.reject(error)
    }

    // Marque la requête pour éviter boucle infinie
    originalRequest._retry = true

    // Si un refresh est déjà en cours, on met en attente puis on rejoue après
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newAccess) => {
          if (!newAccess) return reject(error)
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          resolve(api(originalRequest))
        })
      })
    }

    // Démarre un refresh
    isRefreshing = true
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
        { refresh },
        { withCredentials: false }
      )
      const newAccess = resp.data?.access
      if (!newAccess) throw new Error('No access in refresh response')

      // Sauvegarde nouveaux tokens
      setTokens({ access: newAccess, refresh })

      // Notifie les requêtes en attente
      onRefreshed(newAccess)
      // Remet le header et rejoue la requête initiale
      originalRequest.headers.Authorization = `Bearer ${newAccess}`

      return api(originalRequest)
    } catch (e) {
      // Refresh a échoué -> purge et rejette
      clearTokens()
      onRefreshed(null)
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
