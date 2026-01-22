'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AnalysisResult } from '@/components/AnalysisResult'
import { LoadingScreen } from '@/components/LoadingScreen'

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('job_analyses').select('*').order('created_at', { ascending: false })
      if (data) setHistory(data)
      setLoading(false)
    }
    loadHistory()
  }, [router])

  if (loading) return <LoadingScreen />

  return (
    
    <div className="p-4 md:p-8 2xl:p-12 max-w-2xl md:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-20 md:pt-8 transition-all">
      <h1 className="text-2xl md:text-3xl 2xl:text-5xl font-bold mb-6 2xl:mb-10">Analysis History</h1>
      <div className="grid gap-4 md:gap-6 2xl:gap-8">
        {history.length === 0 && <p className="2xl:text-xl">No saved analyses yet.</p>}
        {history.map((item) => (
          <AnalysisResult 
            key={item.id}
            id={item.id}
            jobTitle={item.job_title}
            matchScore={item.match_score}
            summary={item.tailored_summary}
            missingKeywords={item.missing_keywords}
            createdAt={item.created_at}
            jobDescription={item.job_description}
            initialLearningPath={item.learning_path}
            initialTailoredData={item.tailored_resume_data}
          />
        ))}
      </div>
    </div>
  )
}