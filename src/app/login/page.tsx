'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LOGO_URL } from '@/lib/mockData'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
      return
    }
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center gap-3 mb-3">
            <div className="relative w-20 h-20">
              <Image src={LOGO_URL} alt="Master Oil" fill className="object-contain" />
            </div>
            <div>
              <span className="text-2xl font-black text-brand-gold">MASTER OIL</span>
              <span className="text-2xl font-black text-gray-900 dark:text-brand-cream"> GUINÉE</span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Espace Administration</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8">
          <h1 className="text-gray-900 dark:text-brand-cream font-black text-2xl mb-2">Connexion</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm mb-8">
            Accès réservé aux administrateurs autorisés.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@masteroilguinee.com"
                className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 dark:text-zinc-300 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-3 pr-12 text-gray-900 dark:text-brand-cream placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-gold focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-brand-cream transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 dark:text-zinc-600 text-xs mt-6">
          Master Oil Guinée — Administration
        </p>
      </div>
    </div>
  )
}
