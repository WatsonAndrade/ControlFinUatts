import { useRef, useState } from "react";
import { importCsvText } from "../services/gastos";


type Props = { onImported?: () => void };

export default function ImportCsv({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg(null);
    setBusy(true);
    try {
      const text = await file.text();
      const r = await importCsvText(text);
      setMsg(`Lidas ${r.totalLidas} • Importadas ${r.importadas} • Ignoradas ${r.ignoradas}`);
      onImported?.();
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      setMsg(`Erro: ${err?.response?.data || err.message}`);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = ""; // reseta input
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
        {busy ? "Importando..." : "Importar CSV"}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
          disabled={busy}
        />
      </label>
      {msg && <span className="text-sm text-zinc-300">{msg}</span>}
    </div>
  );
}