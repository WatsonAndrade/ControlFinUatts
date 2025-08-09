import React from "react";
import ImportCsv from "./ImportCsv";

type Props = {
  mesNumero: number;
  anoPagamento: number;
  onChangeMes: (m: number) => void;
  onChangeAno: (a: number) => void;
  onImported: () => void;
};

const meses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

export default function Header({
  mesNumero,
  anoPagamento,
  onChangeMes,
  onChangeAno,
  onImported,
}: Props) {
  return (
    <header className="bg-zinc-800 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-white">Controle Financeiro</h1>

      <div className="flex gap-2 items-center">
        <select
          className="bg-zinc-700 text-white px-3 py-2 rounded-lg"
          value={mesNumero}
          onChange={(e) => onChangeMes(Number(e.target.value))}
        >
          {meses.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>

        <select
          className="bg-zinc-700 text-white px-3 py-2 rounded-lg"
          value={anoPagamento}
          onChange={(e) => onChangeAno(Number(e.target.value))}
        >
          {Array.from({ length: 6 }, (_, k) => new Date().getFullYear() - k).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <ImportCsv onImported={onImported} />
      </div>
    </header>
  );
}
