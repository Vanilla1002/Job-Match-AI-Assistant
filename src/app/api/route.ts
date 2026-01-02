import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. Initialize the library with your secret key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Get the texts from the browser
    const { resume, jobDescription } = await req.json();

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 2. Send to GPT-4o (the smartest and fastest model right now)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert HR recruiter. Compare the user resume with the job description. Output a JSON object with: match_score (number 0-100), missing_keywords (array of strings), and tailored_summary (string, in English)."
        },
        {
          role: "user",
          content: `Resume: ${resume}\n\nJob Description: ${jobDescription}`
        }
      ],
      response_format: { type: "json_object" } // Force it to return clean JSON
    });

    // מחזירים את התשובה לדפדפן
    const result = JSON.parse(completion.choices[0].message.content!);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Error analyzing data' }, { status: 500 });
  }
}