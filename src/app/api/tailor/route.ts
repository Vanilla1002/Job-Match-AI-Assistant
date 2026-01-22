import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateTailoredResume } from '@/lib/AiServices';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    
    const { jobDescription, missingSkills, analysisId } = await req.json();

    if (!analysisId) throw new Error("Analysis ID is required");

    
    const { data: existingAnalysis } = await supabase
      .from('job_analyses')
      .select('tailored_resume_data')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    
    if (existingAnalysis?.tailored_resume_data) {
      console.log("Returning cached resume from DB");
      return NextResponse.json(existingAnalysis.tailored_resume_data);
    }

    

    
    const { data: profile } = await supabase
      .from('profiles')
      .select('resume_text')
      .eq('id', user.id)
      .single();

    if (!profile?.resume_text) throw new Error("No original resume found in profile");

    
    const tailoredData = await generateTailoredResume(
        profile.resume_text, 
        jobDescription, 
        missingSkills
    );

    
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