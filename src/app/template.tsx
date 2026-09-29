// Remonta a cada navegação, animando a entrada de cada página.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
