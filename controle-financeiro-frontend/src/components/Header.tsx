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
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function Header({
  mesNumero,
  anoPagamento,
  onChangeMes,
  onChangeAno,
  onImported,
}: Props) {
  const { user, logout } = useAuth();

  const currentYear = new Date().getFullYear();
  const minYear = Math.min(anoPagamento - 5, currentYear - 5);
  const maxYear = Math.max(anoPagamento + 5, currentYear + 5);
  const anos: number[] = [];
  for (let y = maxYear; y >= minYear; y--) anos.push(y);

  return (
    <header className="bg-zinc-800/95 backdrop-blur px-4 py-4 shadow-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1 text-center lg:text-left">
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Controle Financeiro</h1>
          {user && (
            <span className="text-xs text-zinc-400 lg:hidden">
              {user.displayName || user.email}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:justify-end">
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:w-auto lg:grid-cols-[minmax(0,160px)_minmax(0,140px)]">
            <select
              className="h-11 w-full rounded-lg bg-zinc-700 px-3 text-sm text-white ring-1 ring-zinc-600 outline-none transition focus:ring-2 focus:ring-indigo-500 sm:text-base"
              value={mesNumero}
              onChange={(e) => onChangeMes(Number(e.target.value))}
            >
              {meses.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="h-11 w-full rounded-lg bg-zinc-700 px-3 text-sm text-white ring-1 ring-zinc-600 outline-none transition focus:ring-2 focus:ring-indigo-500 sm:text-base"
              value={anoPagamento}
              onChange={(e) => onChangeAno(Number(e.target.value))}
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <ImportCsv onImported={onImported} />

          {user && (
            <div className="flex w-full items-center gap-3 rounded-lg bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 lg:w-auto lg:bg-transparent lg:px-0">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-700"
                />
              )}
              <span className="flex-1 truncate text-left text-xs sm:text-sm lg:hidden">
                {user.displayName || user.email}
              </span>
              <span className="hidden text-sm text-zinc-300 lg:inline">
                {user.displayName || user.email}
              </span>
              <button
                onClick={logout}
                className="ml-auto rounded px-3 py-1 text-xs ring-1 ring-zinc-600 transition hover:bg-zinc-700 lg:text-sm"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

