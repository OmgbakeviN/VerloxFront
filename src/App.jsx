import { Link, Outlet } from '@tanstack/react-router'
import { useAuth } from './auth/AuthProvider'

export default function App() {
  const { user, logout } = useAuth()

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ marginRight: 'auto' }}>VerloxMarket</h1>
        <Link to="/">Home</Link>
        <Link to="/health">API Health</Link>
        {user ? (
          <>
            <Link to="/deposit">Deposit</Link>
            <Link to="/history">History</Link>
            <span style={{ fontSize: 14, opacity: 0.8 }}>
              {user.email} — <strong>{Number(user.balance_vc).toLocaleString()} VC</strong>
            </span>
            <button onClick={logout} style={{ padding: '6px 10px' }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </header>

      <Outlet />

      <footer style={{ marginTop: 48, opacity: 0.7 }}>
        <small>Auth JWT (access + refresh) activée</small>
      </footer>
    </div>
  )
}
