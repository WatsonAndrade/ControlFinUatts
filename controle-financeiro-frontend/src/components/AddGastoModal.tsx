import React, { useEffect, useMemo, useState } from "react";
import { criarGasto } from "../services/gastos";

type Props = {
  open: boolean;
  onClose: () => void;
  mesNumero: number;
  anoPagamento: number;
  onCreated?: () => void; // callback após criar
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-zinc-900 ring-1 ring-zinc-800 shadow-xl p-5 text-zinc-100">
        <h2 className="text-lg font-semibold mb-4">Novo Gasto</h2>

        {error && (
          <div className="mb-3 rounded border border-rose-600/40 bg-rose-900/30 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <input
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Aluguel"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <input
              required
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Moradia"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Valor</label>
              <input
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                inputMode="decimal"
                placeholder="0,00"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.pago}
                  onChange={(e) => setForm({ ...form, pago: e.target.checked })}
                  className="h-4 w-4 accent-indigo-500"
                />
                Pago
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Referente a (opcional)</label>
            <input
              value={form.referenteA}
              onChange={(e) => setForm({ ...form, referenteA: e.target.value })}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex.: Pessoal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Mês</label>
              <select
                value={form.mesNumero}
                onChange={(e) => setForm({ ...form, mesNumero: Number(e.target.value) })}
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mesesPtBR.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Ano</label>
              <select
                value={form.anoPagamento}
                onChange={(e) => setForm({ ...form, anoPagamento: Number(e.target.value) })}
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 6 }, (_, k) => new Date().getFullYear() - k).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Total de parcelas (opcional)</label>
              <input
                value={form.totalParcelas}
                onChange={(e) => setForm({ ...form, totalParcelas: e.target.value })}
                inputMode="numeric"
                placeholder="Ex.: 12"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Parcela atual (opcional)</label>
              <input
                value={form.parcelaAtual}
                onChange={(e) => setForm({ ...form, parcelaAtual: e.target.value })}
                inputMode="numeric"
                placeholder="Ex.: 1"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 ring-1 ring-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm ring-1 ring-zinc-700 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave || busy}
              className="rounded-lg px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

