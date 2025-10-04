import { useRef, useState } from "react";
import { importCsvText, previewCsvText } from "../services/gastos";

type Props = { onImported?: () => void };

export default function ImportCsv({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [diaFechamento, setDiaFechamento] = useState<number>(3);
  const [anchor, setAnchor] = useState<boolean>(true);
  const [mesNumero, setMesNumero] = useState<number>(new Date().getMonth() + 1);
  const [anoPagamento, setAnoPagamento] = useState<number>(new Date().getFullYear());
  const [statementMode, setStatementMode] = useState<boolean>(true);
  const [generateFuture, setGenerateFuture] = useState<boolean>(false);
  const [preview, setPreview] = useState<null | {
    totalLidas: number;
    importadas: number;
    ignoradas: number;
    resumoMeses: { mesNumero: number; anoPagamento: number; total: number; quantidade: number }[];
    resumoCategorias: { categoria: string; total: number; quantidade: number }[];
    totalValor: number;
    qtdAvista: number;
    qtdParcelados: number;
    topItens: { descricao: string; categoria: string; valor: number; mesNumero: number; anoPagamento: number; parcelaAtual?: number; totalParcelas?: number }[];
  }>(null);

  function trySuggestFromFilename(file: File) {
    // Tenta extrair AAAA-MM do nome do arquivo
    const m = file.name.match(/(20\d{2})[-_](0[1-9]|1[0-2])/);
    if (m) {
      const ano = parseInt(m[1], 10);
      const mes = parseInt(m[2], 10);
      setAnoPagamento(ano);
      setMesNumero(mes);
    }
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      alert("Selecione um arquivo CSV.");
      return;
    }
    if (!diaFechamento || diaFechamento < 1 || diaFechamento > 31) {
      alert("Informe o dia de fechamento entre 1 e 31.");
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      const r = await importCsvText(text, {
        diaFechamento,
        anchor: generateFuture ? false : anchor,
        mesNumero,
        anoPagamento,
        statementMode: generateFuture ? false : statementMode,
      });
      setMsg(`Fechamento ${diaFechamento} · Lidas ${r.totalLidas} · Importadas ${r.importadas} · Ignoradas ${r.ignoradas}`);
      setOpen(false);
      if (fileRef.current) fileRef.current.value = "";
      onImported?.();
    } catch (err: any) {
      setMsg(`Erro: ${err?.response?.data || err.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handlePreview() {
    const file = fileRef.current?.files?.[0];
    if (!file) { alert("Selecione um arquivo CSV."); return; }
    if (!diaFechamento || diaFechamento < 1 || diaFechamento > 31) { alert("Informe o dia entre 1 e 31."); return; }
    trySuggestFromFilename(file);
    setPreview(null);
    setBusy(true);
    try {
      const text = await file.text();
      const p = await previewCsvText(text, {
        diaFechamento,
        anchor: generateFuture ? false : anchor,
        mesNumero,
        anoPagamento,
        statementMode: generateFuture ? false : statementMode,
      });
      setPreview(p);
    } catch (err: any) {
      setMsg(`Erro no preview: ${err?.response?.data || err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
        disabled={busy}
      >
        {busy ? "Importando..." : "Importar CSV"}
      </button>

      {msg && <span className="text-sm text-zinc-300">{msg}</span>}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 ring-1 ring-zinc-700">
            <h3 className="text-lg font-semibold mb-4">Importar CSV</h3>
            <div className="space-y-3">
              <label className="block text-sm text-zinc-300">
                Dia de fechamento do cartão
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={diaFechamento}
                  onChange={(e) => setDiaFechamento(Number(e.target.value))}
                  className="mt-1 w-full rounded bg-zinc-800 px-3 py-2 text-zinc-100 ring-1 ring-zinc-700 outline-none"
                />
              </label>

              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <input id="ancora" type="checkbox" checked={anchor} onChange={(e)=>setAnchor(e.target.checked)} />
                <label htmlFor="ancora">Forçar competência para</label>
                <select value={mesNumero} onChange={(e)=>setMesNumero(Number(e.target.value))} className="bg-zinc-800 ring-1 ring-zinc-700 rounded px-2 py-1">
                  {Array.from({length:12},(_,i)=>i+1).map(m=>(<option key={m} value={m}>{String(m).padStart(2,'0')}</option>))}
                </select>
                <input type="number" value={anoPagamento} onChange={(e)=>setAnoPagamento(Number(e.target.value))} className="w-20 bg-zinc-800 ring-1 ring-zinc-700 rounded px-2 py-1" />
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <input id="stmt" type="checkbox" checked={statementMode} onChange={(e)=>setStatementMode(e.target.checked)} />
                <label htmlFor="stmt">Somente parcela atual (modo fatura)</label>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  id="future"
                  type="checkbox"
                  checked={generateFuture}
                  onChange={(e)=>{
                    const v = e.target.checked;
                    setGenerateFuture(v);
                    if (v) { setStatementMode(false); setAnchor(false); }
                  }}
                />
                <label htmlFor="future">Gerar parcelas futuras (planejamento)</label>
              </div>

              <label className="block text-sm text-zinc-300">
                Arquivo CSV
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="mt-1 block w-full text-sm text-zinc-300"
                />
              </label>

              {preview && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="text-zinc-200">Resumo</div>
                  <div className="text-zinc-400">
                    Lidas {preview.totalLidas} · Importadas {preview.importadas} · Ignoradas {preview.ignoradas} · Total {preview.totalValor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
                  </div>
                  <div className="text-zinc-400">À vista {preview.qtdAvista} · Parcelados {preview.qtdParcelados}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-zinc-300 mb-1">Por mês</div>
                      <ul className="space-y-1">
                        {preview.resumoMeses.map(m => (
                          <li key={`${m.anoPagamento}-${m.mesNumero}`} className="flex justify-between">
                            <span>{String(m.mesNumero).padStart(2,'0')}/{m.anoPagamento} ({m.quantidade})</span>
                            <span>{m.total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-zinc-300 mb-1">Por categoria</div>
                      <ul className="space-y-1">
                        {preview.resumoCategorias.map((c,i) => (
                          <li key={`${i}-${c.categoria}`} className="flex justify-between">
                            <span>{c.categoria} ({c.quantidade})</span>
                            <span>{c.total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-zinc-300 mb-1 mt-2">Top 10 itens</div>
                    <ul className="space-y-1">
                      {preview.topItens.map((t, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{t.descricao}{t.parcelaAtual ? ` - Parcela ${t.parcelaAtual}/${t.totalParcelas}` : ''} · {String(t.mesNumero).padStart(2,'0')}/{t.anoPagamento}</span>
                          <span>{t.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={handlePreview} disabled={busy} className="px-3 py-2 rounded ring-1 ring-zinc-700">Ver resumo</button>
                <button onClick={() => { setOpen(false); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }} className="px-3 py-2 rounded ring-1 ring-zinc-700">Cancelar</button>
                <button onClick={handleImport} disabled={busy} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50">Importar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
