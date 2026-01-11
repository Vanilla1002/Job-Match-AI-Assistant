'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

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

  if (loading) return null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-blue-600 fill-blue-100" />
            JobMatch<span className="text-blue-600">AI</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600">Log in</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Powered by GPT-4o
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Optimize your resume for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">every single job</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Stop sending generic resumes. Our AI analyzes the job description, finds your missing skills, creates a custom learning path, and generates a tailored PDF resume instantly.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
                  Start Analyzing Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">Everything you need to get hired</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<TrendingUp size={32} className="text-green-500" />}
                title="Smart Match Score" 
                desc="Get an instant score (0-100%) showing exactly how well your profile matches the job requirements."
              />
              <FeatureCard 
                icon={<Sparkles size={32} className="text-purple-500" />}
                title="AI Tailored Resume" 
                desc="Generate a brand new, PDF-ready resume that highlights the specific skills the recruiter is looking for."
              />
              <FeatureCard 
                icon={<FileText size={32} className="text-blue-500" />}
                title="Learning Path" 
                desc="Missing a skill? Get a custom study plan with resources and project ideas to bridge the gap."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <p>© 2026 JobMatch AI. Built for developers.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="bg-white dark:bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}