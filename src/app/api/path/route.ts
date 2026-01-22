import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateLearningPath } from '@/lib/AiServices';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { analysisId, missingKeywords, jobTitle, jobDescription } = await req.json();

    
    const learningPath = await generateLearningPath(missingKeywords, jobTitle, jobDescription);

    
    const { error } = await supabase
      .from('job_analyses')
      .update({ learning_path: learningPath })
      .eq('id', analysisId)
      .eq('user_id', user.id); 

    if (error) throw error;

    return NextResponse.json(learningPath);

  } catch (error: any) {
    console.error('Path Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}