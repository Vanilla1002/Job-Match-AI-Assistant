import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    
    const { text, totalPages } = await extractText(arrayBuffer);

    let finalText = '';
    
    if (Array.isArray(text)) {
      finalText = text.join('\n\n');
    } else {
      finalText = text || '';
    }

    return NextResponse.json({ text: finalText, totalPages });
    
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}