import React, { useEffect, useState } from "react";

const GREETINGS = [
  `Olá, DEV! Pronto para estimar seu projeto?`,
  `Bem-vindo ao Devlator! Vamos calcular juntos?`,
  `Preparado para descobrir o valor do seu projeto?`,
  `Vamos começar sua jornada de precificação!`,
  `Devlator: sua calculadora para projetos de DEV!`,
];

export default function TypingGreeting() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

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
      }, 2200);
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, index]);

  return (
    <pre className="text-lg sm:text-2xl font-mono bg-white/10 dark:bg-black/20 rounded-xl px-6 py-4 shadow-lg backdrop-blur border border-white/20 transition-all animate-fade-in">
      <span>{displayed}</span>
      <span className="inline-block w-2 animate-blink">|</span>
    </pre>
  );
}
