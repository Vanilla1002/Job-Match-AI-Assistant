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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('resume_data')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.resume_data) {
      return NextResponse.json({ error: 'Resume not found. Please update your profile.' }, { status: 404 });
    }

    // Convert to ResumeData type
    const resumeData = profile.resume_data as ResumeData;

    // 4. Step A: Analyze AND Validate the job description
    const jobAnalysisResult = await parseJobDescription(jobDescription);

    // --- Validation Gate ---
    if (!jobAnalysisResult.isValid || !jobAnalysisResult.data) {
      // Return a 400 error with the specific reason from AI (e.g., "This is a recipe")
      return NextResponse.json(
        { error: jobAnalysisResult.validationReason || "Invalid job description provided." }, 
        { status: 400 }
      );
    }
    // ---------------------

    // 5. Step B: Perform smart comparison (using the valid data)
    const analysisResult = await analyzeMatch(resumeData, jobAnalysisResult.data);

    // Return result to client
    return NextResponse.json(analysisResult);

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}