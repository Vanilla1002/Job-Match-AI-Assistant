import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateLearningPath } from '@/lib/AiServices';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { analysisId, missingKeywords, jobTitle, jobDescription } = await req.json();

    // 1. הפעלת ה-AI
    const learningPath = await generateLearningPath(missingKeywords, jobTitle, jobDescription);

    // 2. שמירת התוצאה בבסיס הנתונים (כדי שבהיסטוריה זה כבר יופיע מוכן)
    const { error } = await supabase
      .from('job_analyses')
      .update({ learning_path: learningPath })
      .eq('id', analysisId)
      .eq('user_id', user.id); // אבטחה: לוודא שזה הניתוח של המשתמש הזה

    if (error) throw error;

    return NextResponse.json(learningPath);

  } catch (error: any) {
    console.error('Path Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}