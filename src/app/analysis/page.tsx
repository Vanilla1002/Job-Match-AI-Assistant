'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Sparkles, AlertCircle, Zap } from 'lucide-react'
import { AnalysisResult } from '@/components/AnalysisResult'
import Link from 'next/link'
import { toast } from "sonner"
import { LoadingScreen } from '@/components/LoadingScreen'
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const router = useRouter()
  const [hasResume, setHasResume] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [dailyUsage, setDailyUsage] = useState(0)
  const DAILY_LIMIT = 3;
  const [jobTitle, setJobTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentResult, setCurrentResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('updated_at, resume_data').eq('id', user.id).single()
      if (profile && profile.resume_data) {
        setHasResume(true)
        setLastUpdated(profile.updated_at)
      }

      const today = new Date();
      today.setHours(0,0,0,0);
      const { count } = await supabase.from('job_analyses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', today.toISOString())
      if (count !== null) setDailyUsage(count);
      setLoading(false)
    }
    initData()
  }, [router])

  const handleAnalyze = async () => {
    if (dailyUsage >= DAILY_LIMIT) {
      toast.error("Daily Limit Reached", { description: "You have used your 3 free analyses for today. Come back tomorrow!" }); return;
    }
    if (!hasResume) {
      toast.error("Missing Resume", { description: "You must upload a resume in your profile first." }); return;
    }
    if (!jobTitle || !description) {
      toast.error("Missing Details", { description: "Please fill in both Job Title and Description." }); return;
    }
    
    setIsAnalyzing(true)
    setCurrentResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: description }) 
      })
      const aiResult = await response.json()
      if (aiResult.error) throw new Error(aiResult.error)

      const { data, error } = await supabase.from('job_analyses').insert({
          user_id: user?.id,
          job_title: jobTitle,
          job_description: description,
          match_score: aiResult.match_percentage,
          missing_keywords: aiResult.gap_analysis.critical_missing_skills,
          tailored_summary: aiResult.detailed_feedback
        }).select().single()

      if (error) throw new Error(error.message || JSON.stringify(error))

      if (data) {
        setCurrentResult(data)
        setDailyUsage(prev => prev + 1)
        toast.success("Analysis Complete!", { description: `Matched ${data.match_score}% with the job.` })
      }
    } catch (err: any) {
      const errorMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
      toast.error("Analysis Failed", { description: errorMsg || "Something went wrong. Please try again." })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) return <LoadingScreen />
  
  return (
      // שינוי: הרחבת הקונטיינר למסכים גדולים
      <div className="p-4 md:p-8 2xl:p-12 max-w-2xl md:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-20 md:pt-8 transition-all">      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl 2xl:text-5xl font-bold text-slate-900">New Job Analysis</h1>
          <p className="text-slate-500 mt-1 2xl:text-xl">Paste job details and get instant match</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={`px-3 py-1 2xl:px-4 2xl:py-2 text-sm 2xl:text-base border-slate-200 ${dailyUsage >= DAILY_LIMIT ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                <Zap size={14} className="mr-1 fill-current 2xl:w-5 2xl:h-5" />
                Daily Limit: {dailyUsage} / {DAILY_LIMIT}
            </Badge>

            <div className="bg-white p-3 2xl:p-5 rounded-lg border shadow-sm text-sm 2xl:text-base">
            {hasResume ? (
                <div className="text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 2xl:w-3 2xl:h-3 bg-green-500 rounded-full animate-pulse"/>
                <div>
                    <div className="font-bold">Resume Active</div>
                    <div className="text-xs 2xl:text-sm text-slate-500">Last updated: {new Date(lastUpdated!).toLocaleDateString()}</div>
                </div>
                </div>
            ) : (
                <div className="text-red-500 flex items-center gap-2">
                <AlertCircle size={16} className="2xl:w-5 2xl:h-5"/>
                <div>
                    <div className="font-bold">Missing Resume</div>
                    <Link href="/profile" className="text-xs underline text-blue-500">Click here to add</Link>
                </div>
                </div>
            )}
            </div>
        </div>
      </div>

      <Card className="shadow-md bg-white">
        <CardHeader>
          <CardTitle className="2xl:text-2xl">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 2xl:space-y-6">
          <Input 
            placeholder="Job Title (e.g.: Senior Frontend Developer)"
            // הגדלת הגובה והפונט במסכים גדולים
            className="text-lg p-6 2xl:h-16 2xl:text-xl"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Textarea 
            placeholder="Paste the full job description here (Requirements, Responsibilities...)"
            // הגדלת הגובה המינימלי והפונט
            className="min-h-[200px] 2xl:min-h-[300px] resize-none text-base 2xl:text-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !hasResume || dailyUsage >= DAILY_LIMIT} 
            className={`w-full h-14 2xl:h-16 text-lg 2xl:text-xl shadow-lg transition-all hover:scale-[1.01] ${
                dailyUsage >= DAILY_LIMIT 
                ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 animate-spin 2xl:w-6 2xl:h-6" /> Analyzing Match...</>
            ) : dailyUsage >= DAILY_LIMIT ? (
              <>Daily Limit Reached (3/3)</>
            ) : (
              <><Sparkles className="mr-2 2xl:w-6 2xl:h-6" /> Analyze Match Now</>
            )}
          </Button>

          {dailyUsage >= DAILY_LIMIT && (
            <Alert className="bg-orange-50 border-orange-200 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>You've hit your daily limit</AlertTitle>
              <AlertDescription>
                You can perform up to 3 analyses per day. Your quota will reset at midnight.
              </AlertDescription>
            </Alert>
          )}

          {!hasResume && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Resume Required</AlertTitle>
              <AlertDescription>
                Cannot perform analysis without a resume. <Link href="/profile" className="underline font-bold">Go to Profile</Link> to update.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {currentResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl 2xl:text-4xl font-bold mb-4 mt-8 text-slate-900">Analysis Results</h2>
          <AnalysisResult 
            id={currentResult.id}
            jobTitle={currentResult.job_title}
            matchScore={currentResult.match_score}
            summary={currentResult.tailored_summary}
            missingKeywords={currentResult.missing_keywords}
            createdAt={currentResult.created_at}
            jobDescription={currentResult.job_description}
            initialLearningPath={currentResult.learning_path}
            initialTailoredData={currentResult.tailored_resume_data}
          />
        </div>
      )}
    </div>
  )
}