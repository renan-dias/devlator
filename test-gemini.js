// Script para testar a chave da API do Gemini
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔑 Testando chave da API do Gemini...');
console.log('Chave carregada:', process.env.GEMINI_API_KEY ? '✅ Sim' : '❌ Não');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não encontrada no .env.local');
  process.exit(1);
}

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('🚀 Enviando teste para o Gemini...');
    const result = await model.generateContent('Responda apenas "OK" se você está funcionando.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Sucesso! Resposta do Gemini:', text);
    console.log('🎉 A API está funcionando corretamente!');
  } catch (error) {
    console.error('❌ Erro ao testar Gemini:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
      console.log('1. Verifique se a chave está correta no Google AI Studio');
      console.log('2. Gere uma nova chave em: https://makersuite.google.com/app/apikey');
      console.log('3. Certifique-se de que a API Generative Language está habilitada');
      console.log('4. Verifique se há cotas/limites na sua conta Google Cloud');
    }
  }
}

testGemini();
