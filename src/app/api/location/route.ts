import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Pegar IP do usuário
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '8.8.8.8'; // Fallback para IP público (Google DNS)

    // Usar API gratuita para geolocalização por IP
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,timezone,currency`);
    
    if (!geoResponse.ok) {
      throw new Error('Erro ao obter localização');
    }

    const geoData = await geoResponse.json();

    if (geoData.status === 'fail') {
      // Fallback para Brasil
      return NextResponse.json({
        country: 'Brazil',
        region: 'São Paulo',
        city: 'São Paulo',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        coordinates: {
          lat: -23.5505,
          lon: -46.6333
        }
      });
    }

    return NextResponse.json({
      country: geoData.country || 'Brazil',
      region: geoData.regionName || 'São Paulo',
      city: geoData.city || 'São Paulo',
      currency: geoData.currency || 'BRL',
      timezone: geoData.timezone || 'America/Sao_Paulo',
      coordinates: {
        lat: geoData.lat || -23.5505,
        lon: geoData.lon || -46.6333
      }
    });

  } catch (error) {
    console.error('Erro ao obter localização:', error);
    
    // Fallback para São Paulo, Brasil
    return NextResponse.json({
      country: 'Brazil',
      region: 'São Paulo', 
      city: 'São Paulo',
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      coordinates: {
        lat: -23.5505,
        lon: -46.6333
      }
    });
  }
}
