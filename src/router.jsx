// Router unique de l'app, centralise la navigation
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import Home from './pages/Home'
import Health from './pages/Health'
import Company from './pages/Company'

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
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

const routeTree = rootRoute.addChildren([indexRoute, healthRoute, companyRoute])

export const router = createRouter({ routeTree })

// Déclaration nécessaire pour l'auto-complétion (TS) — ignorée en JS
// (laisse-la, elle n’impacte pas le build JS)
