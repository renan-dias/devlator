import React, { useEffect, useState } from "react";

const GREETINGS = [
  `console.log("Olá DEV! Pronto para estimar?");`,
  `function calcularProjeto() { return "Sucesso!"; }`,
  `// TODO: Precificar meu próximo projeto`,
  `const projeto = new Estimativa();`,
  `if (dev.temProjeto) { usar(Devlator); }`,
  `npm install devlator-estimativas`,
  `git commit -m "Projeto precificado!"`,
  `let valor = await calcularEstimativa();`,
];

export default function TypingGreeting() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    // Randomizar a primeira saudação
    setIndex(Math.floor(Math.random() * GREETINGS.length));
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typing && displayed.length < GREETINGS[index].length) {
      timeout = setTimeout(() => {
        setDisplayed(GREETINGS[index].slice(0, displayed.length + 1));
      }, 40);
    } else if (typing && displayed.length === GREETINGS[index].length) {
      setTyping(false);
      timeout = setTimeout(() => {
        setTyping(true);
        setDisplayed("");
        setIndex((prev) => (prev + 1) % GREETINGS.length);
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, index]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <pre className="text-sm md:text-lg font-mono bg-[#282a36] rounded-xl px-4 md:px-6 py-3 md:py-4 shadow-lg border border-[#44475a] transition-all animate-fade-in overflow-x-auto">
        <span className="text-[#50fa7b]">{displayed}</span>
        <span className="inline-block w-2 animate-blink text-[#f8f8f2]">|</span>
      </pre>
    </div>
  );
}
