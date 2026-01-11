import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateTailoredResume } from '@/lib/AiServices';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // הוספנו את analysisId לבקשה
    const { jobDescription, missingSkills, analysisId } = await req.json();

    if (!analysisId) throw new Error("Analysis ID is required");

    // 1. בדיקה: האם כבר קיים מידע שמור ב-DB?
    const { data: existingAnalysis } = await supabase
      .from('job_analyses')
      .select('tailored_resume_data')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    // אם יש מידע שמור - תחזיר אותו ותחסוך קריאה ל-AI!
    if (existingAnalysis?.tailored_resume_data) {
      console.log("Returning cached resume from DB");
      return NextResponse.json(existingAnalysis.tailored_resume_data);
    }

    // --- אם הגענו לפה, סימן שאין שמירה וצריך לייצר חדש ---

    // 2. שליפת קורות החיים המקוריים מהפרופיל
    const { data: profile } = await supabase
      .from('profiles')
      .select('resume_text')
      .eq('id', user.id)
      .single();

    if (!profile?.resume_text) throw new Error("No original resume found in profile");

    // 3. הפעלת ה-AI
    const tailoredData = await generateTailoredResume(
        profile.resume_text, 
        jobDescription, 
        missingSkills
    );

    // 4. שמירה ב-DB לשימוש חוזר (Cache)
    const { error: updateError } = await supabase
      .from('job_analyses')
      .update({ tailored_resume_data: tailoredData })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    if (updateError) console.error("Failed to cache resume:", updateError);

    return NextResponse.json(tailoredData);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}