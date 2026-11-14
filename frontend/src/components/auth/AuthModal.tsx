import { useState, type FormEvent } from 'react'
import type { User } from '../../types/user'
import { UserIcon, XIcon } from '../common/Icons'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: User) => void
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    if (tab === 'REGISTER' && !name.trim()) {
      setError('Please provide your full name.')
      return
    }

    const resolvedUser: User = {
      id: `usr-${Date.now()}`,
      name: tab === 'REGISTER' ? name.trim() : email.split('@')[0],
      email: email.trim(),
    }

    localStorage.setItem('hm_user', JSON.stringify(resolvedUser))
    onLoginSuccess(resolvedUser)
    onClose()
  }

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: 'usr-msc-demo',
      name: 'Alex Murphy (MSc)',
      email: 'alex.murphy@university.ie',
      phone: '+353 87 123 4567',
    }
    localStorage.setItem('hm_user', JSON.stringify(demoUser))
    onLoginSuccess(demoUser)
    onClose()
  }

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card hm-modal-card--auth" onClick={(e) => e.stopPropagation()}>
        <div className="hm-modal-header">
          <div className="hm-modal-title">
            <UserIcon width={22} height={22} />
            <h3>Hail Mary Member Access</h3>
          </div>
          <button
            type="button"
            className="hm-icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="hm-auth-tabs">
          <button
            type="button"
            className={`hm-auth-tab ${tab === 'LOGIN' ? 'hm-auth-tab--active' : ''}`}
            onClick={() => {
              setTab('LOGIN')
              setError(null)
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`hm-auth-tab ${tab === 'REGISTER' ? 'hm-auth-tab--active' : ''}`}
            onClick={() => {
              setTab('REGISTER')
              setError(null)
            }}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Demo Shortcut for Lecturer Demo */}
        <div className="hm-demo-login-box">
          <button
            type="button"
            className="hm-button hm-button--small hm-button--secondary hm-button--block"
            onClick={handleDemoLogin}
          >
            ⚡ Quick 1-Click Demo Login (MSc Evaluator)
          </button>
        </div>

        {error && <div className="hm-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="hm-auth-form">
          {tab === 'REGISTER' && (
            <div className="hm-form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="hm-input"
              />
            </div>
          )}

          <div className="hm-form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="e.g. sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hm-input"
            />
          </div>

          <div className="hm-form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hm-input"
            />
          </div>

          <button type="submit" className="hm-button hm-button--primary hm-button--block">
            {tab === 'LOGIN' ? 'Sign In to Hail Mary' : 'Create Account & Continue'}
          </button>
        </form>

        <p className="hm-auth-note">
          Simulated local session for MSc evaluation. Ready to point to teammate's user microservice when deployed.
        </p>
      </div>
    </div>
  )
}

