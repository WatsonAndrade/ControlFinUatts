import { useEffect, useMemo, useState } from "react";
import {
  resumoPorCategoria,
  listarGastosPorCategoria,
  atualizarGastoParcial,
  type Gasto,
} from "../services/gastos";

type Props = {
  mesNumero: number;
  anoPagamento: number;
  onChanged?: () => void; // para atualizar resumo/tabela externa ao salvar/alterar
  refreshToken?: number; // força recarregar resumo de fora
};

const CATEGORIA_CARTAO = "Cartão de Crédito"; // categoria usada para lançamentos do cartão

export default function CartaoCreditoResumo({ mesNumero, anoPagamento, onChanged, refreshToken }: Props) {
  const [total, setTotal] = useState<number>(0);
  const [quantidade, setQuantidade] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itens, setItens] = useState<Gasto[]>([]);

  async function carregarResumo() {
    const lista = await resumoPorCategoria(mesNumero, anoPagamento);
    const item = (lista as Array<{ categoria: string; total: number; quantidade: number }>)
      .find((i) => (i.categoria ?? "").toLowerCase() === CATEGORIA_CARTAO.toLowerCase());
    setTotal(item ? item.total : 0);
    setQuantidade(item ? (item as any).quantidade ?? 0 : 0);
  }

  async function carregarDetalhes() {
    setLoading(true);
    try {
      const data = await listarGastosPorCategoria({ mesNumero, anoPagamento, categoria: CATEGORIA_CARTAO });
      setItens(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarResumo();
    // fecha e limpa quando muda o período
    setOpen(false);
    setItens([]);
  }, [mesNumero, anoPagamento, refreshToken]);

  useEffect(() => {
    if (open) carregarDetalhes();
  }, [open]);

  async function togglePago(g: Gasto) {
    await atualizarGastoParcial(g.id, { pago: !g.pago });
    await carregarDetalhes();
    await carregarResumo();
    onChanged?.();
  }

  const totalFmt = useMemo(() => formatMoney(total), [total]);

  return (
    <div className="rounded-xl p-6 shadow-lg bg-indigo-900/40 ring-1 ring-indigo-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-300">Cartão de Crédito</div>
          <div className="mt-1 text-3xl font-bold">{totalFmt}</div>
          <div className="text-xs text-zinc-400 mt-1">{quantidade} lançamentos</div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
        >
          Ver detalhes
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[95vw] max-w-4xl rounded-xl bg-zinc-900 ring-1 ring-zinc-800 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-lg font-semibold">Detalhes do Cartão de Crédito</h3>
              <button onClick={() => setOpen(false)} className="rounded px-3 py-1 ring-1 ring-zinc-700 hover:bg-zinc-800 text-sm">Fechar</button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              <div className="overflow-hidden rounded-xl ring-1 ring-zinc-800">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Descrição</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Parcela</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Valor</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                    {loading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">Carregando...</td>
                      </tr>
                    )}
                    {!loading && itens.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">Sem lançamentos do cartão</td>
                      </tr>
                    )}
                    {!loading && itens.map((g) => (
                      <tr key={g.id} className="hover:bg-zinc-900/60">
                        <td className="px-4 py-3 text-sm text-zinc-100">{g.descricao}</td>
                        <td className="px-4 py-3 text-sm text-zinc-300">{formatParcela(g)}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-100">{formatMoney(g.valor)}</td>
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={g.pago} onChange={() => togglePago(g)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatParcela(g: Gasto) {
  const anyG = g as any;
  const atual = anyG.parcelaAtual;
  const total = anyG.totalParcelas;
  if (atual != null && atual !== "" && Number(atual) > 0) {
    return `Parcela ${total != null && total !== "" ? `${atual}/${total}` : String(atual)}`;
  }
  return "-";
}
