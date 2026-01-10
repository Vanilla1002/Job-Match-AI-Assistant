'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, Loader2, CheckCircle2, ChevronDown, ChevronUp, Upload, FileText } from 'lucide-react'
import { toast } from "sonner" 
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingScreen } from '@/components/LoadingScreen'

// --- Resume Display Component ---
const ResumeDisplay = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxLength = 1000 
  // Safety check: ensure text exists before checking length
  const safeText = text || '';
  const shouldTruncate = safeText.length > maxLength

  if (!safeText) return null;

  return (
    <div className="relative">
      <motion.div 
        layout
        initial={false}
        className={`relative overflow-hidden ${!isExpanded && shouldTruncate ? 'max-h-[300px]' : ''}`}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed selection:bg-green-200 dark:selection:bg-green-900">
          {safeText}
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

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const router = useRouter()
  const topRef = useRef<HTMLDivElement>(null)
  const resumeCardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize as empty string to avoid uncontrolled input warnings
  const [resumeText, setResumeText] = useState<string>('')
  const [savedResumeText, setSavedResumeText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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
      setIsArrowRotated(false)
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => setIsCardOpen(false), 400) 
    } else {
      setIsCardOpen(true)
      setIsArrowRotated(true)
      setTimeout(() => resumeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
  }

  // --- Updated Handle File Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to parse PDF')

      // Ensure we set a string, defaulting to empty string if null
      setResumeText(data.text || '')
      
      toast.success("PDF Content Extracted!", {
        description: "Please review the text and click Save."
      })
      
    } catch (error: any) {
      toast.error("Upload Failed", { description: error.message })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // --- Updated Handle Save (Fixes the Trim Error) ---
  const handleSave = async () => {
    // 1. Convert to string safely (handles null/undefined/numbers/arrays)
    const safeTextToSave = String(resumeText || '');

    // 2. Check if empty after trim
    if (!safeTextToSave.trim()) { 
        toast.error("Cannot save empty resume"); 
        return 
    }
    
    setSaving(true)
    
    try {
      const response = await fetch('/api/profile', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ resumeText: safeTextToSave }) 
      })
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      setSavedResumeText(safeTextToSave);
      setLastUpdated(new Date().toISOString())
      
      if (!isCardOpen) {
          setIsCardOpen(true);
          setIsArrowRotated(true);
          setTimeout(() => {
            resumeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 150)
      }
      
      toast.success("Profile Updated Successfully!")
      
    } catch (error: any) {
      toast.error(error.message || "Save Failed");
    }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingScreen />

  return (
    <div ref={topRef} className="p-8 max-w-4xl mx-auto pb-40 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle>Update Your Resume</CardTitle>
                <CardDescription>Paste text manually or upload a PDF.</CardDescription>
            </div>
            
            <div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                />
                <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || saving}
                    className="gap-2 border-dashed border-2 hover:border-blue-500 hover:text-blue-600"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {isUploading ? "Extracting..." : "Upload PDF"}
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="relative">
            <Textarea 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[400px] font-mono p-4 pr-12"
                placeholder="Paste experience here or upload PDF..."
            />
            <div className="absolute top-4 right-4 text-gray-300 pointer-events-none">
                <FileText size={24} />
            </div>
          </div>

          <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || isUploading} className="w-[170px] h-10 transition-all duration-200 overflow-hidden">
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.span key="saving-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 w-full h-full"
                  >
                    <Loader2 className="animate-spin h-4 w-4" /> 
                    <span className="leading-none mt-[1px]">Analyzing...</span>
                  </motion.span>
                ) : (
                  <motion.span 
                    key="idle-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 w-full h-full"
                  >
                    <Save className="h-4 w-4"/> 
                    <span className="leading-none mt-[1px]">Save & Analyze</span>
                  </motion.span>
                )}
              </AnimatePresence>
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
                            Last updated: {new Date(lastUpdated).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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