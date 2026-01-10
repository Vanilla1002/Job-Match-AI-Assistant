import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateTailoredResume } from '@/lib/AiServices';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { jobDescription, missingSkills } = await req.json();

    const { data: profile } = await supabase
      .from('profiles')
      .select('resume_text')
      .eq('id', user.id)
      .single();

    if (!profile?.resume_text) throw new Error("No resume found");

    const tailoredData = await generateTailoredResume(
        profile.resume_text, 
        jobDescription, 
        missingSkills
    );

    return NextResponse.json(tailoredData);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}