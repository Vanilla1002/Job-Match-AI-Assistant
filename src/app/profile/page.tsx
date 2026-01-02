'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, Loader2 } from 'lucide-react'
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
    if (!resumeText) {
        toast.error("Cannot save empty resume")
        return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      resume_text: resumeText,
      updated_at: new Date()
    })
    
    setSaving(false)

    if (error) {
        toast.error("Save Failed", { description: error.message })
    } else {
        setLastUpdated(new Date().toISOString())
        toast.success("Profile Updated!", {
            description: "Your resume has been saved securely."
        })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Resume</CardTitle>
          <CardDescription>
            {lastUpdated 
              ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
              : 'You haven\'t uploaded a resume yet'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[400px] font-mono p-4"
            placeholder="Paste the full text from your resume file here..."
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-32">
              {saving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-4 w-4"/> Save</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}