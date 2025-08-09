import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  value: number;                   // valor atual
  onSave: (v: number) => void;     // salvar (localStorage / API)
};

export default function EditableMoneyCard({ title, value, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, value]);

  function confirm() {
    const num = Number(String(draft).replace(",", "."));
    if (Number.isFinite(num)) onSave(Number(num.toFixed(2)));
    setEditing(false);
  }

  return (
    <div className="rounded-xl p-6 shadow-lg text-white bg-emerald-900/60">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {!editing && (
          <button
            className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded"
            onClick={() => setEditing(true)}
          >
            Editar
          </button>
        )}
      </div>

      {!editing ? (
        // clique no valor para editar também
        <div
          className="text-4xl font-extrabold tracking-tight cursor-text select-none"
          onClick={() => setEditing(true)}
          title="Clique para editar"
        >
          {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            className="bg-zinc-800 rounded-lg px-3 py-2 w-40 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirm();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <button
            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg text-sm"
            onClick={confirm}
          >
            Salvar
          </button>
          <button
            className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-sm"
            onClick={() => setEditing(false)}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}