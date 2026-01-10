'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { AnalysisResult } from '@/components/AnalysisResult'
import Link from 'next/link'
import { toast } from "sonner"
import { LoadingScreen } from '@/components/LoadingScreen'

export default function Dashboard() {
  const router = useRouter()
  const [hasResume, setHasResume] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  const [jobTitle, setJobTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [currentResult, setCurrentResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('updated_at, resume_data') 
        .eq('id', user.id)
        .single()

      if (data && data.resume_data) {
        setHasResume(true)
        setLastUpdated(data.updated_at)
      }
      setLoading(false)
    }
    checkProfile()
  }, [router])

  // --- New logic: handleAnalyze ---
  const handleAnalyze = async () => {
    if (!hasResume) {
      toast.error("Missing Resume", {
        description: "You must upload a resume in your profile first."
      })
      return
    }

    if (!jobTitle || !description) {
      toast.error("Missing Details", {
        description: "Please fill in both Job Title and Description."
      })
      return
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

      const { data, error } = await supabase
        .from('job_analyses')
        .insert({
          user_id: user?.id,
          job_title: jobTitle,
          job_description: description,
          match_score: aiResult.match_percentage,
          missing_keywords: aiResult.gap_analysis.critical_missing_skills,
          tailored_summary: aiResult.detailed_feedback
        })
        .select()
        .single()

      if (error) throw new Error(error.message || JSON.stringify(error))

      if (data) {
        setCurrentResult(data)
        toast.success("Analysis Complete!", {
          description: `Matched ${data.match_score}% with the job.`
        })
      }

    } catch (err: any) {
      const errorMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err))
      toast.error("Analysis Failed", {
        description: errorMsg || "Something went wrong. Please try again."
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

    if (loading) return <LoadingScreen />
  
  return (
      <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Job Analysis</h1>
          <p className="text-slate-500 mt-1">Paste job details and get instant match</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border shadow-sm text-sm">
          {hasResume ? (
            <div className="text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              <div>
                <div className="font-bold">Resume Active</div>
                <div className="text-xs text-slate-500">Last updated: {new Date(lastUpdated!).toLocaleDateString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-red-500 flex items-center gap-2">
              <AlertCircle size={16} />
              <div>
                <div className="font-bold">Missing Resume</div>
                <Link href="/profile" className="text-xs underline text-blue-500">Click here to add</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="shadow-md bg-white">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Job Title (e.g.: Senior Frontend Developer)"
            className="text-lg p-6"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Textarea 
            placeholder="Paste the full job description here (Requirements, Responsibilities...)"
            className="min-h-[200px] resize-none text-base"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !hasResume}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition-all hover:scale-[1.01]"
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 animate-spin" /> Analyzing Match...</>
            ) : (
              <><Sparkles className="mr-2" /> Analyze Match Now</>
            )}
          </Button>

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
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Analysis Results</h2>
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