'use client'

import { useState, useEffect } from 'react' // <--- הוספנו useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Code, 
  Loader2, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp,
  Youtube,
  FileText,
  MonitorPlay,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from "sonner"

// Define the updated interface locally
interface Resource {
  title: string;
  type: 'video' | 'course' | 'documentation' | 'article';
  platform: string;
  author?: string;
}

interface AnalysisResultProps {
  id: string;
  jobTitle: string
  matchScore: number
  summary: string
  missingKeywords: string[]
  createdAt: string
  initialLearningPath?: any 
  jobDescription?: string
}

export function AnalysisResult({ 
  id, 
  jobTitle, 
  matchScore, 
  summary, 
  missingKeywords, 
  createdAt,
  initialLearningPath,
  jobDescription
}: AnalysisResultProps) {
  
  const scoreColor = matchScore >= 80 ? "bg-green-500" : matchScore >= 50 ? "bg-yellow-500" : "bg-red-500"
  
  const [learningPath, setLearningPath] = useState(initialLearningPath)
  const [isLoadingPath, setIsLoadingPath] = useState(false)
  const [isPathVisible, setIsPathVisible] = useState(false)

  // --- התיקון הקריטי: סנכרון הנתונים מהדאטה-בייס ל-State ---
  useEffect(() => {
    if (initialLearningPath) {
      setLearningPath(initialLearningPath)
    }
  }, [initialLearningPath])
  // ---------------------------------------------------------

  const handleGeneratePath = async () => {
    // אם כבר יש נתיב (מהדאטה בייס או שנוצר הרגע), רק נפתח/נסגור
    if (learningPath) {
      setIsPathVisible(!isPathVisible)
      return
    }

    setIsLoadingPath(true)
    try {
      const response = await fetch('/api/path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          analysisId: id, 
          missingKeywords, 
          jobTitle,
          jobDescription 
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setLearningPath(data)
      setIsPathVisible(true)
      toast.success("Learning path generated!")

    } catch (error) {
      toast.error("Failed to generate path")
    } finally {
      setIsLoadingPath(false)
    }
  }

  // Helper to render icon based on resource type
  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'video': return <Youtube size={14} className="text-red-500" />;
      case 'course': return <MonitorPlay size={14} className="text-purple-500" />;
      case 'documentation': return <FileText size={14} className="text-blue-500" />;
      default: return <BookOpen size={14} className="text-slate-500" />;
    }
  }

  // Helper to construct a smart search URL
  const getSearchUrl = (res: Resource) => {
    const query = `${res.title} ${res.platform} ${res.author || ''}`
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`
  }

  return (
    <Card className="w-full mb-4 shadow-lg border-t-4 border-t-blue-500 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-slate-800">{jobTitle}</CardTitle>
        <Badge className={`${scoreColor} text-white hover:${scoreColor}`}>
          {matchScore}% Match
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Score Area */}
        <div className="flex items-center gap-4 mb-4">
           <Progress value={matchScore} className="h-2" />
        </div>

        {/* Summary */}
        <div className="bg-slate-50 p-4 rounded-md mb-4 border border-slate-100">
            <p className="text-sm text-gray-700 leading-relaxed" dir="rtl">
                {summary}
            </p>
        </div>

        {/* Missing Keywords */}
        {missingKeywords && missingKeywords.length > 0 && (
          <div className="space-y-2 mb-6">
            <span className="text-sm font-semibold text-red-600">Missing Skills:</span>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* --- Learning Path Button & Content --- */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button 
            onClick={handleGeneratePath} 
            disabled={isLoadingPath}
            variant={learningPath ? "outline" : "default"}
            className={`w-full ${!learningPath && "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"}`}
          >
            {isLoadingPath ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your plan...</>
            ) : learningPath ? (
              <>{isPathVisible ? "Hide" : "View"} Recommended Learning Path {isPathVisible ? <ChevronUp className="ml-2 h-4 w-4"/> : <ChevronDown className="ml-2 h-4 w-4"/>}</>
            ) : (
              <><GraduationCap className="mr-2 h-4 w-4" /> Generate Learning Path & Projects</>
            )}
          </Button>

          <AnimatePresence>
            {isPathVisible && learningPath && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-6">
                  
                  {/* Part 1: Skills & Specific Resources */}
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-slate-800 text-lg">
                      <BookOpen size={20} className="text-blue-600"/> 
                      Targeted Study Plan ({learningPath.estimated_time_weeks} weeks est.)
                    </h4>
                    
                    <div className="grid gap-4">
                      {learningPath.missing_skills.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-slate-800 text-base">{item.skill}</h5>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                          
                          {/* Resources List */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Resources:</p>
                            <div className="grid gap-2">
                              {item.resources.map((res: Resource, rIdx: number) => (
                                <a 
                                  key={rIdx}
                                  href={getSearchUrl(res)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 group transition-colors cursor-pointer text-decoration-none"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    {getResourceIcon(res.type)}
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 truncate">
                                      {res.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-white border-slate-200">
                                      {res.platform}
                                    </Badge>
                                    <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-500"/>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 2: Practical Project */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold flex items-center gap-2 text-indigo-900 text-lg">
                          <Code size={20} className="text-indigo-600"/> 
                          Capstone Project: {learningPath.project_suggestion.title}
                        </h4>
                        <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-200">
                            {learningPath.project_suggestion.difficulty}
                        </Badge>
                    </div>
                    
                    <p className="text-sm text-indigo-800 mb-4 leading-relaxed">
                      {learningPath.project_suggestion.description}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {learningPath.project_suggestion.tech_stack.map((tech: string, i: number) => (
                            <Badge key={i} className="bg-indigo-200 text-indigo-800 hover:bg-indigo-300 border-none">
                                {tech}
                            </Badge>
                        ))}
                    </div>

                    <div className="bg-white/60 p-4 rounded-lg">
                        <span className="text-xs font-bold text-indigo-900 uppercase">Key Features:</span>
                        <ul className="list-disc list-inside text-sm text-indigo-700 space-y-1 mt-2">
                        {learningPath.project_suggestion.key_features.map((feat: string, i: number) => (
                            <li key={i}>{feat}</li>
                        ))}
                        </ul>
                         <div className="mt-3 pt-3 border-t border-indigo-100">
                             <span className="text-xs font-bold text-indigo-900 uppercase">Why this helps you get hired:</span>
                             <p className="text-sm text-indigo-600 mt-1 italic">
                                 "{learningPath.project_suggestion.real_world_use_case}"
                             </p>
                         </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 text-right">
            {new Date(createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardContent>
    </Card>
  )
}