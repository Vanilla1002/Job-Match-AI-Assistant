'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from "sonner" 
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingScreen } from '@/components/LoadingScreen'

const ResumeDisplay = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxLength = 1000 
  const shouldTruncate = text.length > maxLength

  return (
    <div className="relative">
      <motion.div 
        layout
        initial={false}
        className={`relative overflow-hidden ${!isExpanded && shouldTruncate ? 'max-h-[300px]' : ''}`}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed selection:bg-green-200 dark:selection:bg-green-900">
          {text}
        </p>
        
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-800 dark:via-slate-800/80 pointer-events-none" />
        )}
      </motion.div>

      {shouldTruncate && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation(); 
              setIsExpanded(!isExpanded);
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-slate-700 transition-colors"
          >
            {isExpanded ? (
              <span className="flex items-center gap-1">Show Less <ChevronUp size={14}/></span>
            ) : (
              <span className="flex items-center gap-1">Read Full Resume <ChevronDown size={14}/></span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const topRef = useRef<HTMLDivElement>(null)
  const resumeCardRef = useRef<HTMLDivElement>(null)

  const [resumeText, setResumeText] = useState('')
  const [savedResumeText, setSavedResumeText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  const [isCardOpen, setIsCardOpen] = useState(false)
  const [isArrowRotated, setIsArrowRotated] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('resume_text, updated_at').eq('id', user.id).single()
      if (data && data.resume_text) {
        setSavedResumeText(data.resume_text)
        setLastUpdated(data.updated_at)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const toggleResume = () => {
    if (isCardOpen) {
      // --- CLOSING ---
      setIsArrowRotated(false)
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // שינוי 1: קיצרנו את הזמן ל-400ms כדי שהסגירה תתחיל מהר יותר
      setTimeout(() => {
        setIsCardOpen(false)
      }, 400) 

    } else {
      // --- OPENING ---
      setIsCardOpen(true)
      setIsArrowRotated(true)
      setTimeout(() => {
        resumeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  const handleSave = async () => {
    if (!resumeText.trim()) { toast.error("Cannot save empty resume"); return }
    setSaving(true)
    try {
      const response = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText }) })
      if (!response.ok) throw new Error('Failed')
      setSavedResumeText(resumeText);
      setLastUpdated(new Date().toISOString())
      
      if (!isCardOpen) {
          setIsCardOpen(true);
          setIsArrowRotated(true);
          setTimeout(() => {
            resumeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 150)
      }
      
      toast.success("Profile Updated!")
    } catch (error: any) { toast.error("Save Failed") } 
    finally { setSaving(false) }
  }

  if (loading) return <LoadingScreen />

  return (
    <div ref={topRef} className="p-8 max-w-4xl mx-auto pb-40 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Update Your Resume</CardTitle>
          <CardDescription>Paste your resume text here to update it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[400px] font-mono p-4"
            placeholder="Experience..."
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-40">
              {saving ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Analyzing...</> : <><Save className="mr-2 h-4 w-4"/> Save & Analyze</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {savedResumeText && (
        <div>
            <Card 
                ref={resumeCardRef} 
                className="border-green-200 bg-green-50 dark:bg-slate-900 dark:border-green-800 overflow-hidden scroll-mt-24 transition-all duration-300"
            >
            <CardHeader 
                className="cursor-pointer flex flex-row items-center justify-between space-y-0 select-none"
                onClick={toggleResume}
            >
                <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Your Current Resume</CardTitle>
                {lastUpdated && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-white px-2 py-1 rounded-full border border-green-200 dark:bg-slate-800 dark:text-green-400 dark:border-green-700">
                    <CheckCircle2 size={12} />
                    <span>Saved</span>
                    </div>
                )}
                </div>
                
                <motion.div
                animate={{ rotate: isArrowRotated ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                >
                <ChevronDown className="text-green-600 dark:text-green-400" />
                </motion.div>
            </CardHeader>

            <AnimatePresence initial={false}>
                {isCardOpen && (
                <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                    }}
                    // שינוי 2: duration מהיר יותר (0.3)
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                    <CardContent 
                        onClick={toggleResume}
                        className="cursor-pointer"
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="bg-white dark:bg-slate-800 p-6 rounded-md border border-green-200 dark:border-green-800 shadow-sm cursor-text"
                        >
                            <ResumeDisplay text={savedResumeText} />
                        </div>
                        
                        {lastUpdated && (
                            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 select-none">
                            Last updated: {new Date(lastUpdated).toLocaleString()}
                            </div>
                        )}
                    </CardContent>
                </motion.div>
                )}
            </AnimatePresence>
            </Card>
        </div>
      )}
    </div>
  )
}