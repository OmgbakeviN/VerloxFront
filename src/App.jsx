// Layout de base avec un header simple + rendu des pages
import { Link, Outlet } from '@tanstack/react-router'

export default function App() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      {/* Header de dev minimal */}
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ marginRight: 'auto' }}>VerloxMarket (V1 Setup - JS)</h1>
        <Link to="/">Home</Link>
        <Link to="/health">API Health</Link>
      </header>

      {/* Zone de rendu des routes enfants */}
      <Outlet />

      {/* Footer */}
      <footer style={{ marginTop: 48, opacity: 0.7 }}>
        <small>Jour 1 — Kickoff & setup (Frontend JS)</small>
      </footer>
    </div>
  )
}
