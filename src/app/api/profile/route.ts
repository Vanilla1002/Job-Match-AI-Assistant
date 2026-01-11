import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { parseResume } from '@/lib/AiServices'; 

export async function POST(req: Request) {
  const supabase = await createClient();
  const { resumeText } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsedResult = await parseResume(resumeText);

    if (!parsedResult.isValid) {
        return NextResponse.json({ error: parsedResult.validationReason }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        resume_text: resumeText,      
        resume_data: parsedResult.data,
        personal_details: parsedResult.personal_details, 
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true, parsedData: parsedResult.data }); 
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}