'use client' 

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // State חדש לניהול המצב (האם אנחנו בהרשמה או התחברות)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  
  // State למניעת הבהוב בטעינה ראשונית
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.replace('/analysis')
        } else {
          setCheckingAuth(false)
        }
      } catch (error) {
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [router])

  const handleError = (msg: string) => {
    setError(msg)
    setSuccessMessage(null)
    setTimeout(() => setError(null), 4000)
  }

  // פונקציה אחת שמנהלת את הכל לפי המצב הנוכחי
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isSignUpMode) {
        // --- לוגיקת הרשמה ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setSuccessMessage('Account created! Please check your email to verify.')
        // אופציונלי: אפשר להעביר את המשתמש למצב התחברות או לנקות שדות
      } else {
        // --- לוגיקת התחברות ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/analysis')
      }
    } catch (error: any) {
      handleError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // פונקציה למעבר בין מצבים
  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode)
    setError(null)
    setSuccessMessage(null)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      {/* רקע דקורטיבי */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-8 transition-all duration-300">
          
          {/* כותרת משתנה לפי המצב */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {isSignUpMode ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUpMode 
                ? 'Sign up to start your career journey' 
                : 'Sign in to manage your career path'}
            </p>
          </div>

          {/* טופס אחיד */}
          <form className="space-y-6" onSubmit={handleAuthAction}>
            <div className="space-y-4">
              
              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="name@company.com"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {/* הודעות שגיאה או הצלחה */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
             {successMessage && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center animate-in fade-in slide-in-from-top-1">
                {successMessage}
              </div>
            )}

            {/* כפתור ראשי משתנה */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUpMode ? 'Sign Up' : 'Sign In'} 
                  {isSignUpMode ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                </>
              )}
            </button>
            
            {/* כפתור החלפת מצב (Toggle) */}
            <div className="text-center pt-2">
              <button
                type="button" // חשוב: type button מונע שליחת טופס
                onClick={toggleMode}
                disabled={loading}
                className="text-slate-400 hover:text-white text-sm font-medium py-2 transition-colors"
              >
                {isSignUpMode ? (
                  <span>Already have an account? <span className="text-blue-400 hover:underline">Sign In</span></span>
                ) : (
                  <span>Don't have an account? <span className="text-blue-400 hover:underline">Sign Up</span></span>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  )
}