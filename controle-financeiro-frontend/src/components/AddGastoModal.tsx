import React, { useEffect, useMemo, useState } from "react";
import { criarGasto } from "../services/gastos";

type Props = {
  open: boolean;
  onClose: () => void;
  mesNumero: number;
  anoPagamento: number;
  onCreated?: () => void;
};

const mesesPtBR = [
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

export default function AddGastoModal({ open, onClose, mesNumero, anoPagamento, onCreated }: Props) {
  const [form, setForm] = useState({
    descricao: "",
    categoria: "Outros",
    valor: "",
    pago: false,
    mesNumero,
    anoPagamento,
    referenteA: "",
    totalParcelas: "",
    parcelaAtual: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        descricao: "",
        categoria: "Outros",
        valor: "",
        pago: false,
        mesNumero,
        anoPagamento,
        referenteA: "",
        totalParcelas: "",
        parcelaAtual: "",
      });
      setError(null);
    }
  }, [open, mesNumero, anoPagamento]);

  const canSave = useMemo(() => {
    const valorNum = Number(String(form.valor).replace(/\./g, "").replace(/,/g, "."));
    const hasCategoria = form.categoria.trim().length > 0;
    return form.descricao.trim().length > 0 && hasCategoria && Number.isFinite(valorNum) && valorNum > 0;
  }, [form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || busy) return;
    setBusy(true);
    setError(null);
    try {
      const valorNum = Number(String(form.valor).replace(/\./g, "").replace(/,/g, "."));
      const totalP = String(form.totalParcelas).trim() === "" ? null : Number(form.totalParcelas);
      const parcAt = String(form.parcelaAtual).trim() === "" ? null : Number(form.parcelaAtual);
      await criarGasto({
        descricao: form.descricao.trim(),
        categoria: form.categoria.trim(),
        valor: Number(valorNum.toFixed(2)),
        pago: form.pago,
        mesNumero: Number(form.mesNumero),
        anoPagamento: Number(form.anoPagamento),
        referenteA: form.referenteA?.trim() ? form.referenteA.trim() : null,
        totalParcelas: totalP,
        parcelaAtual: parcAt,
      });
      onClose();
      onCreated?.();
    } catch (err: any) {
      setError(err?.response?.data || err?.message || "Erro ao salvar gasto.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 p-5 text-zinc-100 ring-1 ring-zinc-800 shadow-xl sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Novo Gasto</h2>

        {error && (
          <div className="mb-3 rounded border border-rose-600/40 bg-rose-900/30 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Descrição</label>
            <input
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Aluguel"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Categoria</label>
            <input
              required
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Moradia"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Valor</label>
              <input
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                inputMode="decimal"
                placeholder="0,00"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.pago}
                onChange={(e) => setForm({ ...form, pago: e.target.checked })}
                className="h-4 w-4 accent-indigo-500"
              />
              <label className="text-sm">Pago</label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Referente a (opcional)</label>
            <input
              value={form.referenteA}
              onChange={(e) => setForm({ ...form, referenteA: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Pessoal"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Mês</label>
              <select
                value={form.mesNumero}
                onChange={(e) => setForm({ ...form, mesNumero: Number(e.target.value) })}
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mesesPtBR.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm">Ano</label>
              <select
                value={form.anoPagamento}
                onChange={(e) => setForm({ ...form, anoPagamento: Number(e.target.value) })}
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 6 }, (_, k) => new Date().getFullYear() - k).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Total de parcelas (opcional)</label>
              <input
                value={form.totalParcelas}
                onChange={(e) => setForm({ ...form, totalParcelas: e.target.value })}
                inputMode="numeric"
                placeholder="Ex.: 12"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Parcela atual (opcional)</label>
              <input
                value={form.parcelaAtual}
                onChange={(e) => setForm({ ...form, parcelaAtual: e.target.value })}
                inputMode="numeric"
                placeholder="Ex.: 1"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm ring-1 ring-zinc-700 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave || busy}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

