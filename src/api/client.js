// Client HTTP centralisé (axios) avec baseURL de l'API
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // On utilisera un header Authorization plus tard si JWT
})

// // Exemple si plus tard tu ajoutes un token :
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

export default api
