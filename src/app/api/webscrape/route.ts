import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    // Validar URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Fazer fetch do site
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Erro ao acessar o site: ${response.status} ${response.statusText}` 
      }, { status: 400 });
    }

    const html = await response.text();
    
    // Extrair informações básicas
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]*)"[^>]*>/i);
    
    // Extrair headings
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    
    // Extrair texto dos parágrafos (limitado)
    const pMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
    const paragraphs = pMatches.slice(0, 5).map(p => p.replace(/<[^>]*>/g, '').trim());

    const extractedData = {
      url: validUrl.toString(),
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      keywords: keywordsMatch ? keywordsMatch[1].trim() : '',
      headings: {
        h1: h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()).slice(0, 3),
        h2: h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()).slice(0, 5)
      },
      paragraphs: paragraphs,
      domain: validUrl.hostname
    };

    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('Erro no webscraping:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor ao processar o site' 
    }, { status: 500 });
  }
}
