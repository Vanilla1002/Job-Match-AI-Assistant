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
    // Set starting point: midnight of current day (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 
    
    // Count how many analyses the user performed since midnight
    const { count, error: countError } = await supabase
      .from('job_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (countError) throw new Error("Failed to check usage limit");

    // If limit reached - stop here
    if (count !== null && count >= 3) {
      return NextResponse.json(
        { error: "Daily limit reached. You can perform 3 analyses per day. Try again tomorrow!" }, 
        { status: 429 }
      );
    }

    const { jobDescription } = await req.json();
    if (!jobDescription) throw new Error("Job description is required");

    // 3. Fetch structured data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('resume_data')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.resume_data) {
      return NextResponse.json({ error: 'Resume not found. Please update your profile.' }, { status: 404 });
    }

    const resumeData = profile.resume_data as ResumeData;

    // 4. Analyze & Validate Job
    const jobAnalysisResult = await parseJobDescription(jobDescription);

    if (!jobAnalysisResult.isValid || !jobAnalysisResult.data) {
      return NextResponse.json(
        { error: jobAnalysisResult.validationReason || "Invalid job description provided." }, 
        { status: 400 }
      );
    }

    // 5. Compare
    const analysisResult = await analyzeMatch(resumeData, jobAnalysisResult.data);

    return NextResponse.json(analysisResult);

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}