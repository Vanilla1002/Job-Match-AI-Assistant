'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { toast } from "sonner" 

export default function ProfilePage() {
  const router = useRouter()
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
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
        
      if (data) {
        setResumeText(data.resume_text || '')
        setLastUpdated(data.updated_at)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!resumeText.trim()) {
        toast.error("Cannot save empty resume")
        return
    }

    setSaving(true)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      setLastUpdated(new Date().toISOString())
      toast.success("Profile Updated!", {
          description: "Your resume has been analyzed and saved securely."
      })
      
    } catch (error: any) {
        toast.error("Save Failed", { description: error.message })
    } finally {
        setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {lastUpdated && (
           <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
             <CheckCircle2 size={14} />
             <span>AI Analysis Ready</span>
           </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Resume</CardTitle>
          <CardDescription>
            {lastUpdated 
              ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
              : 'Paste your resume text here. Our AI will analyze it for future matches.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[400px] font-mono p-4"
            placeholder="Experience&#10;Software Engineer...&#10;&#10;Education&#10;B.Sc Computer Science..."
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="w-40"
            >
              {saving ? (
                <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Analyzing...</>
              ) : (
                <><Save className="mr-2 h-4 w-4"/> Save & Analyze</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}