import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AnalysisResultProps {
  jobTitle: string
  matchScore: number
  summary: string
  missingKeywords: string[]
  createdAt: string
}

export function AnalysisResult({ jobTitle, matchScore, summary, missingKeywords, createdAt }: AnalysisResultProps) {
  // Set color based on score
  const scoreColor = matchScore >= 80 ? "bg-green-500" : matchScore >= 50 ? "bg-yellow-500" : "bg-red-500"
  
  return (
    <Card className="w-full mb-4 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{jobTitle}</CardTitle>
        <Badge className={`${scoreColor} text-white hover:${scoreColor}`}>
          {matchScore}% Match
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
           <Progress value={matchScore} className="h-2" />
        </div>

        <div className="bg-slate-50 p-4 rounded-md mb-4 dark:bg-slate-900">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {summary}
            </p>
        </div>

        {missingKeywords && missingKeywords.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-semibold text-red-600">Missing from resume:</span>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-400 text-left" dir="ltr">
            {new Date(createdAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}