import React from "react";
import { useAuth } from "../auth/AuthProvider";
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
  const { user, logout } = useAuth();
  // Gera anos dinâmicos incluindo futuros (±5 do ano atual/selecionado)
  const currentYear = new Date().getFullYear();
  const minYear = Math.min(anoPagamento - 5, currentYear - 5);
  const maxYear = Math.max(anoPagamento + 5, currentYear + 5);
  const anos: number[] = [];
  for (let y = maxYear; y >= minYear; y--) anos.push(y);
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
          {anos.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <ImportCsv onImported={onImported} />
        {user && (
          <div className="flex items-center gap-2 ml-2">
            {user.photoURL && <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />}
            <span className="text-sm text-zinc-300">{user.displayName || user.email}</span>
            <button onClick={logout} className="ml-2 text-xs px-2 py-1 rounded ring-1 ring-zinc-700 hover:bg-zinc-800">Sair</button>
          </div>
        )}
      </div>
    </header>
  );
}
