import { useEffect, useMemo, useState } from "react";
import {
  listarGastosPaginado,
  atualizarGastoParcial,
  excluirGasto,
  type Gasto,
  type Page,
} from "../services/gastos";

// por enquanto só ordenamos por "valor" (campo existente no backend)
type SortKey = "valor";
type SortDir = "asc" | "desc";

interface Props {
  mesNumero: number;
  anoPagamento: number;
  pageSize?: number; // valor inicial (default 10)
  excludeCategoria?: string; // oculta lançamentos desta categoria
  refreshToken?: number; // força recarregar (após criar/editar)
  onAddNew?: () => void; // abre modal de novo gasto
}

export default function GastosTable({ mesNumero, anoPagamento, pageSize = 10, excludeCategoria, refreshToken, onAddNew }: Props) {
  const [page, setPage] = useState<Page<Gasto> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  // controla itens por página (inicia com prop)
  const [pageSizeState, setPageSizeState] = useState<number>(pageSize);
  useEffect(() => setPageSizeState(pageSize), [pageSize]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("valor");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pagoFilter, setPagoFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // edição inline por id
  const [editing, setEditing] = useState<Record<number, { descricao?: string; categoria?: string | null; valor?: string }>>({});

  // mapeia chave da UI -> campo real do backend
  const SORT_MAP: Record<SortKey, string> = { valor: "valor" };
  const sortParam = useMemo(() => `${SORT_MAP[sortKey]},${sortDir}`, [sortKey, sortDir]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listarGastosPaginado({
        mesNumero,
        anoPagamento,
        page: pageIndex,
        size: pageSizeState,       // usa o estado atual
        // search: search || undefined, // habilitar quando o backend aceitar
        sort: sortParam,           // seguro: "valor,asc|desc"
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

  // reset para a primeira página ao mudar filtros
  useEffect(() => {
    setPageIndex(0);
  }, [mesNumero, anoPagamento, search, sortParam, pageSizeState, refreshToken, pagoFilter]);

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
    <div className="mt-8">
      {/* Barra de busca e ordenação */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição/categoria"
            className="w-72 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-400 outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => load()}
            className="rounded-lg px-3 py-2 text-sm ring-1 ring-zinc-700 hover:bg-zinc-800"
            title="Buscar"
          >
            Buscar
          </button>
          <label className="text-sm text-zinc-300 ml-2">Ordenar por</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
          >
            <option value="valor">Valor</option>
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as SortDir)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <label className="text-sm text-zinc-300 ml-2">Exibir</label>
          <select
            value={pagoFilter}
            onChange={(e) => setPagoFilter(e.target.value as any)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
          >
            <option value="all">Todos</option>
            <option value="paid">Pagos</option>
            <option value="unpaid">Não pagos</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 hidden">
          <label className="text-sm text-zinc-300">Ordenar por</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
          >
            <option value="valor">Valor</option>
          </select>
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as SortDir)}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-zinc-700"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          {/* Itens por página */}
          <div className="ml-2 flex items-center gap-2 hidden">
            <label className="text-sm text-zinc-300">Itens por página</label>
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
          </div>
        </div>

        {onAddNew && (
          <div className="flex justify-end">
            <button
              onClick={onAddNew}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              + Novo Gasto
            </button>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl ring-1 ring-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mês/Ano
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Categoria
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pago
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                  Carregando...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-400">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && page && page.empty && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                  Nenhum gasto encontrado para o período.
                </td>
              </tr>
            )}

            {!loading && !error && page && !page.empty && page.content.map((g) => {
              const edit = editing[g.id];
              return (
                <tr key={g.id} className="hover:bg-zinc-900/60">
                  {/* Mês/Ano */}
                  <td className="px-4 py-3 text-sm text-zinc-200">
                    {g.mesPagamento ? g.mesPagamento : formatMesAno(g.mesNumero, g.anoPagamento)}
                  </td>

                  {/* Descrição */}
                  <td className="px-4 py-3 text-sm">
                    {edit ? (
                      <input
                        autoFocus
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
                      <span className="text-zinc-100">{g.descricao}</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="px-4 py-3 text-sm">
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
                      <span className="text-zinc-300">{g.categoria ?? "-"}</span>
                    )}
                  </td>

                  {/* Valor */}
                  <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-100">
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
                        className="w-28 rounded bg-zinc-800 px-2 py-1 text-zinc-100 ring-1 ring-zinc-700 outline-none text-right"
                      />
                    ) : (
                      <span>{formatMoney(g.valor)}</span>
                    )}
                  </td>

                  {/* Pago */}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={g.pago}
                      onChange={() => togglePago(g)}
                      className="h-4 w-4 accent-indigo-500"
                    />
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3 text-right">
                    {edit ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveEdit(g.id)} className="rounded px-2 py-1 text-sm ring-1 ring-indigo-500 hover:bg-indigo-500/10">
                          Salvar
                        </button>
                        <button onClick={() => cancelEdit(g.id)} className="rounded px-2 py-1 text-sm ring-1 ring-zinc-700 hover:bg-zinc-800">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(g)} className="rounded px-2 py-1 text-sm ring-1 ring-zinc-700 hover:bg-zinc-800">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(g)} className="rounded px-2 py-1 text-sm ring-1 ring-red-700 hover:bg-red-700/10">
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

      {/* Paginação + seletor de tamanho */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-zinc-300">
        <div>
          {page
            ? `Página ${page.number + 1} de ${page.totalPages} — ${page.totalElements} itens`
            : "—"}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Itens por página</label>
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
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!page || page.first || loading}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="rounded px-3 py-1 ring-1 ring-zinc-700 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={!page || page.last || loading}
              onClick={() => setPageIndex((p) => p + 1)}
              className="rounded px-3 py-1 ring-1 ring-zinc-700 disabled:opacity-40"
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

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


