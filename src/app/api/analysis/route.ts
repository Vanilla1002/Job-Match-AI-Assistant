import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server'; 
import { parseJobDescription, analyzeMatch, ResumeData } from '@/lib/AiServices';

export async function POST(req: Request) {
  // 1. Initialize Supabase on server side
  const supabase = await createClient();
  
  // 2. Check authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { jobDescription } = await req.json();
    if (!jobDescription) throw new Error("Job description is required");

    // 3. Fetch structured data (resume_data) from user's profile
    // We don't trust the client to send it, we take it from the secure DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('resume_data')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.resume_data) {
      return NextResponse.json({ error: 'Resume not found. Please update your profile.' }, { status: 404 });
    }

    // Convert to ResumeData type to make TypeScript happy
    const resumeData = profile.resume_data as ResumeData;

    // 4. Step A: Analyze the job (user sent text, we convert to JSON)
    const jobData = await parseJobDescription(jobDescription);

    // 5. Step B: Perform smart comparison
    const analysisResult = await analyzeMatch(resumeData, jobData);

    // Return result to client (client will save it to history)
    return NextResponse.json(analysisResult);

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}