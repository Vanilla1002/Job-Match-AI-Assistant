import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { parseResume } from '@/lib/AiServices'; 

export async function POST(req: Request) {
  const supabase = await createClient();
  
  const { resumeText } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    
    const parsedData = await parseResume(resumeText);

    
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        resume_text: resumeText,      
        resume_data: parsedData,     
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true, parsedData }); 
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}