import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'
import { syncCredentialsFromRoster, verifyCredentials } from '../utils/credentials'
import styles from './Login.module.css'

export default function Login() {
  const { roster } = useTeam()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    syncCredentialsFromRoster(roster).catch(() => {})
  }, [roster])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.')
      return
    }
    setLoading(true)
    try {
      const result = await verifyCredentials(trimmedEmail, password)
      if (result) {
        if (result.role === 'parent') {
          login({ id: result.id, name: result.name, role: 'parent', playerId: result.playerId })
        } else {
          login({ id: result.id, name: result.name, role: result.role })
        }
        navigate('/', { replace: true })
      } else {
        setError('Invalid email or password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.subtitle}>Enter your email and password.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className={styles.input}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          <p className={styles.hint}>
            Coaches use their coach email; players use their player email; parents use the guardian email on file. New accounts use the default password: <strong>volleyball</strong>. Directors: use <strong>director@setly.app</strong> with password <strong>director</strong> to manage multiple teams.
          </p>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
