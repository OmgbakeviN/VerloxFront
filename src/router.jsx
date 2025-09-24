// Router unique de l'app, centralise la navigation
import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import App from './App'
import Home from './pages/Home'
import Health from './pages/Health'
import Company from './pages/Company'
import Login from './pages/Login'
import History from './pages/History'
import { useAuth } from './auth/AuthProvider'

// Garde simple: composant wrapper
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p>Chargement session…</p>
  if (!user) {
    // pas connecté -> redirection login
    throw redirect({ to: '/login' })
  }
  return children
}

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health',
  component: Health,
})

const companyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company/$symbol',
  component: Company,
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: () => (
    <RequireAuth>
      <History />
    </RequireAuth>
  ),
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, healthRoute, companyRoute, historyRoute])

export const router = createRouter({ routeTree })

// Déclaration nécessaire pour l'auto-complétion (TS) — ignorée en JS
// (laisse-la, elle n’impacte pas le build JS)
