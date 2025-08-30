// Router unique de l'app, centralise la navigation
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import Home from './pages/Home'
import Health from './pages/Health'

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

const routeTree = rootRoute.addChildren([indexRoute, healthRoute])

export const router = createRouter({ routeTree })

// Déclaration nécessaire pour l'auto-complétion (TS) — ignorée en JS
// (laisse-la, elle n’impacte pas le build JS)
