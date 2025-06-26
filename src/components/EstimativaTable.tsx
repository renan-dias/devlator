import React from "react";

export type Estimativa = {
  categoria: string;
  descricao: string;
  valor: string;
};

export default function EstimativaTable({ estimativas }: { estimativas: Estimativa[] }) {
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <table className="w-full text-left border-collapse font-mono bg-[#282a36]/80 rounded-xl overflow-hidden shadow-lg">
        <thead className="bg-[#44475a] text-[#bd93f9]">
          <tr>
            <th className="py-2 px-4">Categoria</th>
            <th className="py-2 px-4">Descrição</th>
            <th className="py-2 px-4">Valor</th>
          </tr>
        </thead>
        <tbody>
          {estimativas.map((est, i) => (
            <tr key={i} className="border-b border-[#44475a]">
              <td className="py-2 px-4">{est.categoria}</td>
              <td className="py-2 px-4">{est.descricao}</td>
              <td className="py-2 px-4 text-[#50fa7b]">{est.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
