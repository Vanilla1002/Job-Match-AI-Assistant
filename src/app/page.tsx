'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle, ArrowRight, BrainCircuit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Quick check: if user is already logged in, redirect to app
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/analysis')
      }
      setLoading(false)
    }
    checkSession()
  }, [router])

  if (loading) return null // Prevents flashing during check

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Navbar פשוטה לדף הנחיתה */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="text-blue-600" />
          Job Match <span className="text-blue-600">AI</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Sparkles size={16} />
            <span>Powered by GPT-4o</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Land Your Dream Job <br />
            <span className="text-blue-600">With AI Precision</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Stop guessing. Our AI analyzes your resume against any job description, 
            tells you exactly what's missing, and helps you stand out.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 bg-blue-600 hover:bg-blue-700">
                Start Analyzing Free <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl w-full px-4">
          <FeatureCard 
            title="Instant Analysis" 
            desc="Get a detailed match score in seconds based on skills, experience, and keywords."
          />
          <FeatureCard 
            title="Keyword Gap" 
            desc="Find out exactly which keywords are missing from your resume to pass the ATS."
          />
          <FeatureCard 
            title="Tailored Feedback" 
            desc="Receive specific advice on how to tailor your application for each specific role."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        © 2025 Job Match AI. Built for developers.
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-left">
      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600">
        <CheckCircle size={20} />
      </div>
      <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  )
}