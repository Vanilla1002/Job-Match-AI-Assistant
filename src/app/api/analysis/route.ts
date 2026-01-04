import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { parseJobDescription, analyzeMatch, ResumeData } from '@/lib/AiServices';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { jobDescription } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Fetch prepared data from DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('resume_data')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.resume_data) {
      return NextResponse.json(
        { error: 'Please set up your profile and resume first' }, 
        { status: 400 }
      );
    }

    // Convert to our type (TypeScript)
    const userResumeData = profile.resume_data as ResumeData;

    // 2. Analyze job only (single "expensive" operation)
    const jobData = await parseJobDescription(jobDescription);

    // 3. Perform comparison (fast and cheap operation)
    const matchResult = await analyzeMatch(userResumeData, jobData);

    return NextResponse.json(matchResult);

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze job' }, { status: 500 });
  }
}