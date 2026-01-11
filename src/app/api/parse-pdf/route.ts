import { NextResponse } from 'next/server';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import path from 'path';

// Fix for Node.js environment: explicitly set the worker source
// This prevents the library from failing to find the worker file dynamically
const workerPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to ArrayBuffer and then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    // We create a copy of the buffer to avoid specific parsing issues with some PDF versions
    const uint8Array = new Uint8Array(arrayBuffer.slice(0));

    // Load the document
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      // Disable font loading checks that might fail in Node.js
      disableFontFace: true,
    });
    
    const pdfDocument = await loadingTask.promise;

    let fullText = '';
    const totalPages = pdfDocument.numPages;

    // Iterate through all pages
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDocument.getPage(i);

      // 1. Extract Text Content
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      // 2. Extract Annotations (Links)
      const annotations = await page.getAnnotations();
      
      // Filter only Link objects that have a URL
      const links = annotations
        .filter((annotation: any) => annotation.subtype === 'Link' && annotation.url)
        .map((annotation: any) => annotation.url);

      // 3. Combine text with found links
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