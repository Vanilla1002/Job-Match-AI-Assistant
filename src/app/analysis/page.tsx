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

export default function Dashboard() {
  const router = useRouter()
  const [resumeData, setResumeData] = useState<{text: string, date: string} | null>(null)
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
        .select('resume_text, updated_at')
        .eq('id', user.id)
        .single()

      if (data && data.resume_text) {
        setResumeData({ text: data.resume_text, date: data.updated_at })
      }
      setLoading(false)
    }
    checkProfile()
  }, [router])

  const handleAnalyze = async () => {
    // החלפנו את ה-alert הפשוט ב-Toast אדום ויפה
    if (!resumeData) {
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
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ resume: resumeData.text, jobDescription: description })
      })
      
      const aiResult = await response.json()
      if (aiResult.error) throw new Error(aiResult.error)

      const { data } = await supabase
        .from('job_analyses')
        .insert({
          user_id: user?.id,
          job_title: jobTitle,
          job_description: description,
          match_score: aiResult.match_score,
          missing_keywords: aiResult.missing_keywords,
          tailored_summary: aiResult.tailored_summary
        })
        .select()
        .single()

      if (data) {
        setCurrentResult(data)
        // הודעת הצלחה ירוקה
        toast.success("Analysis Complete!", {
          description: `Matched ${data.match_score}% with the job.`
        })
      }

    } catch (err: any) {
      toast.error("Analysis Failed", {
        description: err.message || "Something went wrong. Please try again."
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">New Job Analysis</h1>
          <p className="text-slate-500 mt-1">Paste job details and get instant match</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border shadow-sm text-sm">
          {resumeData ? (
            <div className="text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              <div>
                <div className="font-bold">Resume Updated</div>
                <div className="text-xs text-slate-500">Updated: {new Date(resumeData.date).toLocaleString()}</div>
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

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Job Title (e.g.: DevOps Engineer)"
            className="text-lg p-6"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Textarea 
            placeholder="Paste the full job description here..."
            className="min-h-[200px] resize-none text-base"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !resumeData}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg transition-all hover:scale-[1.01]"
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="mr-2" /> Analyze Match Now</>
            )}
          </Button>

          {!resumeData && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Cannot perform analysis without a resume. <Link href="/profile" className="underline font-bold">Go to Profile</Link> to update.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {currentResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
          <AnalysisResult 
            jobTitle={currentResult.job_title}
            matchScore={currentResult.match_score}
            summary={currentResult.tailored_summary}
            missingKeywords={currentResult.missing_keywords}
            createdAt={currentResult.created_at}
          />
        </div>
      )}
    </div>
  )
}