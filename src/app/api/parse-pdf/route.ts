import { NextResponse } from 'next/server';
import path from 'path';
if (typeof Promise.withResolvers === 'undefined') {
  // @ts-ignore
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
const globalAny = global as any;
if (!globalAny.DOMMatrix) {
  globalAny.DOMMatrix = class DOMMatrix {
    constructor() { return this; }
    transform() { return this; }
    toString() { return ""; }
  };
}
if (!globalAny.Path2D) {
  globalAny.Path2D = class Path2D { constructor() { return this; } };
}

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const standardFontDataUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      disableFontFace: true,
      standardFontDataUrl: standardFontDataUrl,
      isEvalSupported: false,
      useSystemFonts: false,
    });
    
    const pdfDocument = await loadingTask.promise;

    let fullText = '';
    const totalPages = pdfDocument.numPages;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDocument.getPage(i);
      
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore
        .map((item: any) => item.str)
        .join(' ');

      let links: string[] = [];
      try {
        const annotations = await page.getAnnotations();
        links = annotations
          .filter((annotation: any) => annotation.subtype === 'Link' && annotation.url)
          .map((annotation: any) => annotation.url);
      } catch (e) {
        console.log(`Could not extract links from page ${i}`, e);
      }

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
    return NextResponse.json(
      { error: 'Failed to parse PDF', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}