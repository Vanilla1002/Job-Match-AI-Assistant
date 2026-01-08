import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { parseResume } from '@/lib/AiServices'; 

export async function POST(req: Request) {
  const supabase = await createClient();
  
  const { resumeText } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Send to AI for validation and parsing
    const analysisResult = await parseResume(resumeText);

    // 2. Check if AI rejected the content
    if (!analysisResult.isValid) {
      return NextResponse.json(
        { 
          error: "Invalid content detected", 
          message: analysisResult.validationReason || "The text provided does not appear to be a valid resume." 
        }, 
        { status: 400 } // Return 400 Bad Request
      );
    }

    // 3. If valid, save to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        resume_text: resumeText,      
        resume_data: analysisResult.data, // Saving the clean extracted data
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true, parsedData: analysisResult.data }); 
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}