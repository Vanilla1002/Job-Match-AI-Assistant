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
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('job_analyses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setHistory(data)
      setLoading(false)
    }
    loadHistory()
  }, [router])

  if (loading) return <LoadingScreen />

  return (
    // הוספתי גם כאן את slide-in-from-bottom-4
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-6">Analysis History</h1>
      <div className="grid gap-6">
        {history.length === 0 && <p>No saved analyses yet.</p>}
        {history.map((item) => (
          <AnalysisResult 
            key={item.id}
            jobTitle={item.job_title}
            matchScore={item.match_score}
            summary={item.tailored_summary}
            missingKeywords={item.missing_keywords}
            createdAt={item.created_at}
          />
        ))}
      </div>
    </div>
  )
}