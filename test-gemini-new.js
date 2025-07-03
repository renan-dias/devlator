// Teste da nova implementação do Gemini
const GEMINI_API_KEY = 'será?';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function testGemini() {
  try {
    console.log('🔍 Testando nova API Gemini...');
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Olá! Você é o Devinho, assistente de precificação de software. Responda de forma amigável: Quanto custaria um site simples no Brasil?"
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return;
    }

    const data = await response.json();
    console.log('📊 Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0]) {
      const content = data.candidates[0].content.parts[0].text;
      console.log('✅ Resposta do Devinho:', content);
    } else {
      console.log('⚠️ Nenhuma resposta gerada');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testGemini();
