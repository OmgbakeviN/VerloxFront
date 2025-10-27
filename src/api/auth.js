import api from './client'

export async function register({ email, password }) {
  const res = await api.post('/auth/register/', { email, password })
  return res.data
}
export async function verifyEmail({ email, code }) {
  const res = await api.post('/auth/verify-email/', { email, code })
  return res.data
}
export async function resendPin({ email }) {
  const res = await api.post('/auth/resend-pin/', { email })
  return res.data
}
