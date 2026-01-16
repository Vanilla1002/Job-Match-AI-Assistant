import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import path from 'path';

export async function POST(req: Request) {
  try {
    const standardFontDataUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/');
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      disableFontFace: true, 
      standardFontDataUrl: standardFontDataUrl, 
      isEvalSupported: false, 
      useSystemFonts: false
    });
    
    const pdfDocument = await loadingTask.promise;

    let fullText = '';
    const totalPages = pdfDocument.numPages;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDocument.getPage(i);

      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      const annotations = await page.getAnnotations();
      
      const links = annotations
        .filter((annotation: any) => annotation.subtype === 'Link' && annotation.url)
        .map((annotation: any) => annotation.url);

      fullText += `--- PAGE ${i} ---\n\n`;
      fullText += pageText + '\n\n';
      
      if (links.length > 0) {
        fullText += `[LINKS FOUND ON PAGE ${i}]:\n`;
        fullText += links.map((link: string) => `- ${link}`).join('\n');
        fullText += '\n\n';
      }
    }

    return NextResponse.json({ text: fullText, totalPages });
    
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}