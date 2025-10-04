import { useEffect, useMemo, useState } from "react";
import {
  listarGastosPaginado,
  atualizarGastoParcial,
  excluirGasto,
  type Gasto,
  type Page,
} from "../services/gastos";

type SortKey = "valor";
type SortDir = "asc" | "desc";

interface Props {
  mesNumero: number;
  anoPagamento: number;
  pageSize?: number;
  excludeCategoria?: string;
  refreshToken?: number;
  onAddNew?: () => void;
}

export default function GastosTable({
  mesNumero,
  anoPagamento,
  pageSize = 10,
  excludeCategoria,
  refreshToken,
  onAddNew,
}: Props) {
  const [page, setPage] = useState<Page<Gasto> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSizeState, setPageSizeState] = useState<number>(pageSize);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("valor");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pagoFilter, setPagoFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<number, { descricao?: string; categoria?: string | null; valor?: string }>>({});

  useEffect(() => setPageSizeState(pageSize), [pageSize]);

  const sortParam = useMemo(() => {
    const map: Record<SortKey, string> = { valor: "valor" };
    return `${map[sortKey]},${sortDir}`;
  }, [sortKey, sortDir]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listarGastosPaginado({
        mesNumero,
        anoPagamento,
        page: pageIndex,
        size: pageSizeState,
        sort: sortParam,
        excludeCategoria: excludeCategoria || undefined,
        pago: pagoFilter === "all" ? undefined : pagoFilter === "paid",
      });
      setPage(data);
    } catch (e: any) {
      setError(e?.response?.data || e?.message || "Erro ao carregar gastos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPageIndex(0);
  }, [mesNumero, anoPagamento, pageSizeState, refreshToken, pagoFilter, sortParam]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesNumero, anoPagamento, pageIndex, sortParam, pageSizeState, pagoFilter]);

  function startEdit(g: Gasto) {
    setEditing((prev) => ({
      ...prev,
      [g.id]: { descricao: g.descricao, categoria: g.categoria ?? "", valor: String(g.valor) },
    }));
  }

  function cancelEdit(id: number) {
    setEditing((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }

  async function saveEdit(id: number) {
    const draft = editing[id];
    if (!draft) return;

    const dto: Partial<Pick<Gasto, "descricao" | "categoria" | "valor">> = {};
    if (draft.descricao !== undefined) dto.descricao = draft.descricao;
    if (draft.categoria !== undefined) dto.categoria = draft.categoria || null;
    if (draft.valor !== undefined) {
      const parsed = Number(String(draft.valor).replace(/\./g, "").replace(/,/g, "."));
      if (Number.isFinite(parsed)) dto.valor = Number(parsed.toFixed(2));
    }

    try {
      await atualizarGastoParcial(id, dto);
      cancelEdit(id);
      await load();
    } catch (e: any) {
      alert("Erro ao salvar: " + (e?.response?.data || e?.message || ""));
    }
  }

  async function togglePago(g: Gasto) {
    try {
      await atualizarGastoParcial(g.id, { pago: !g.pago });
      await load();
    } catch {
      alert("Erro ao atualizar status de pagamento.");
    }
  }

  async function handleDelete(g: Gasto) {
    if (!confirm(`Excluir "${g.descricao}"?`)) return;
    try {
      await excluirGasto(g.id);
      if (page && page.content.length === 1 && pageIndex > 0) {
        setPageIndex(pageIndex - 1);
      } else {
        await load();
      }
    } catch {
      alert("Erro ao excluir.");
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-zinc-900/40 p-4 ring-1 ring-zinc-800">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por descrição/categoria"
                className="w-full min-w-0 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-400 outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-indigo-500 sm:w-64"
              />
              <button
                onClick={() => load()}
                className="w-full rounded-lg px-3 py-2 text-sm ring-1 ring-zinc-700 transition hover:bg-zinc-800 sm:w-auto"
                title="Buscar"
              >
                Buscar
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
              <label className="flex items-center gap-2">
                <span>Ordenar por</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
                >
                  <option value="valor">Valor</option>
                </select>
              </label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as SortDir)}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <label className="flex items-center gap-2">
                <span>Exibir</span>
                <select
                  value={pagoFilter}
                  onChange={(e) => setPagoFilter(e.target.value as any)}
                  className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
                >
                  <option value="all">Todos</option>
                  <option value="paid">Pagos</option>
                  <option value="unpaid">Não pagos</option>
                </select>
              </label>
            </div>
          </div>

          {onAddNew && (
            <div className="flex w-full justify-end sm:w-auto">
              <button
                onClick={onAddNew}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 sm:w-auto"
              >
                + Novo Gasto
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-700/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-800">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[720px] divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left">Mês/Ano</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Parcela</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Pago</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950 text-xs sm:text-sm">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                    Carregando...
                  </td>
                </tr>
              )}

              {!loading && page && page.content.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                    Nenhum gasto encontrado para o período selecionado.
                  </td>
                </tr>
              )}

              {!loading &&
                page?.content.map((g) => {
                  const edit = editing[g.id];
                  return (
                    <tr key={g.id} className="hover:bg-zinc-900/60">
                      <td className="px-4 py-3 text-zinc-300">{formatMesAno(g.mesNumero, g.anoPagamento)}</td>
                      <td className="px-4 py-3 text-zinc-100">
                        {edit ? (
                          <input
                            value={edit.descricao ?? ""}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [g.id]: { ...prev[g.id], descricao: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(g.id);
                              if (e.key === "Escape") cancelEdit(g.id);
                            }}
                            className="w-full rounded bg-zinc-800 px-2 py-1 text-zinc-100 ring-1 ring-zinc-700 outline-none"
                          />
                        ) : (
                          <span>{g.descricao}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{formatParcela(g)}</td>
                      <td className="px-4 py-3 text-zinc-300">
                        {edit ? (
                          <input
                            value={edit.categoria ?? ""}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [g.id]: { ...prev[g.id], categoria: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(g.id);
                              if (e.key === "Escape") cancelEdit(g.id);
                            }}
                            className="w-full rounded bg-zinc-800 px-2 py-1 text-zinc-100 ring-1 ring-zinc-700 outline-none"
                          />
                        ) : (
                          <span>{g.categoria ?? "-"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-100">
                        {edit ? (
                          <input
                            value={edit.valor ?? ""}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [g.id]: { ...prev[g.id], valor: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(g.id);
                              if (e.key === "Escape") cancelEdit(g.id);
                            }}
                            className="w-28 rounded bg-zinc-800 px-2 py-1 text-right text-zinc-100 ring-1 ring-zinc-700 outline-none"
                          />
                        ) : (
                          <span>{formatMoney(g.valor)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={g.pago}
                          onChange={() => togglePago(g)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {edit ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => saveEdit(g.id)}
                              className="rounded px-2 py-1 text-xs sm:text-sm ring-1 ring-indigo-500 transition hover:bg-indigo-500/10"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => cancelEdit(g.id)}
                              className="rounded px-2 py-1 text-xs sm:text-sm ring-1 ring-zinc-700 transition hover:bg-zinc-800"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              onClick={() => startEdit(g)}
                              className="rounded px-2 py-1 text-xs sm:text-sm ring-1 ring-zinc-700 transition hover:bg-zinc-800"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(g)}
                              className="rounded px-2 py-1 text-xs sm:text-sm ring-1 ring-red-700 transition hover:bg-red-700/10"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-zinc-900/40 p-4 text-sm text-zinc-300 ring-1 ring-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {page
            ? `Página ${page.number + 1} de ${page.totalPages} • ${page.totalElements} itens`
            : "Sem resultados"}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <label className="flex items-center gap-2">
            <span>Itens por página</span>
            <select
              value={pageSizeState}
              onChange={(e) => {
                setPageSizeState(Number(e.target.value));
                setPageIndex(0);
              }}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button
              disabled={!page || page.first || loading}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="rounded px-3 py-1 ring-1 ring-zinc-700 transition disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={!page || page.last || loading}
              onClick={() => setPageIndex((p) => p + 1)}
              className="rounded px-3 py-1 ring-1 ring-zinc-700 transition disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMesAno(m?: number, a?: number) {
  if (!m || !a) return "-";
  const mm = String(m).padStart(2, "0");
  return `${mm}/${a}`;
}

function formatParcela(g: Gasto) {
  const anyG = g as any;
  const atual = anyG.parcelaAtual;
  const total = anyG.totalParcelas;
  if (atual != null && atual !== "" && Number(atual) > 0) {
    return total != null && total !== ""
      ? `Parcela ${atual}/${total}`
      : `Parcela ${String(atual)}`;
  }
  return "-";
}

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

