import { api } from "./api";

type ImportOptions = {
  mesNumero?: number;
  anoPagamento?: number;
  statementMode?: boolean; // colapsa parcelas para a atual
  anchor?: boolean; // ancora todos em mes/ano fornecidos
  cartaoId?: number; // usa o dia de fechamento do cartao
  diaFechamento?: number; // override direto do dia de fechamento
};

export async function importCsvText(csvText: string, opts?: ImportOptions) {
  const params: Record<string, string | number | boolean> = {};
  if (opts?.statementMode) params.statementMode = true;
  if (opts?.anchor && opts?.mesNumero && opts?.anoPagamento) {
    params.anchor = true;
    params.mesNumero = opts.mesNumero;
    params.anoPagamento = opts.anoPagamento;
  }
  if (opts?.cartaoId) params.cartaoId = opts.cartaoId;
  if (opts?.diaFechamento) params.diaFechamento = opts.diaFechamento;
  const res = await api.post("/gastos/importar-csv", csvText, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    params,
  });
  return res.data as { totalLidas: number; importadas: number; ignoradas: number };
}

export async function previewCsvText(csvText: string, opts?: ImportOptions) {
  const params: Record<string, string | number | boolean> = {};
  if (opts?.statementMode) params.statementMode = true;
  if (opts?.cartaoId) params.cartaoId = opts.cartaoId;
  if (opts?.diaFechamento) params.diaFechamento = opts.diaFechamento;
  if (opts?.anchor && opts?.mesNumero && opts?.anoPagamento) {
    params.anchor = true;
    params.mesNumero = opts.mesNumero;
    params.anoPagamento = opts.anoPagamento;
  }
  const res = await api.post("/gastos/preview-csv", csvText, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    params,
  });
  return res.data as {
    totalLidas: number;
    importadas: number;
    ignoradas: number;
    resumoMeses: { mesNumero: number; anoPagamento: number; total: number; quantidade: number }[];
    resumoCategorias: { categoria: string; total: number; quantidade: number }[];
    totalValor: number;
    qtdAvista: number;
    qtdParcelados: number;
    topItens: { descricao: string; categoria: string; valor: number; mesNumero: number; anoPagamento: number; parcelaAtual?: number; totalParcelas?: number }[];
  };
}

export async function listarGastosPaginado(params: {
  mesNumero: number;
  anoPagamento: number;
  page?: number;
  size?: number;
  pago?: boolean;
  search?: string;
  sort?: string; // ex: "data,desc" | "valor,asc"
  excludeCategoria?: string;
}) {
  const { mesNumero, anoPagamento, page = 0, size = 10, pago, search, sort, excludeCategoria } = params;
  const res = await api.get("/gastos/paginado", { params: { mesNumero, anoPagamento, page, size, pago, search, sort, excludeCategoria } });
  return res.data as Page<Gasto>;
}

export async function resumoPorCategoria(mesNumero: number, anoPagamento: number) {
  const res = await api.get("/gastos/resumo-por-categoria", { params: { mesNumero, anoPagamento } });
  return res.data;
}

export async function resumoMensal(mesNumero: number, anoPagamento: number) {
  const res = await api.get("/gastos/resumo", { params: { mesNumero, anoPagamento } });
  return res.data;
}

export async function listarGastosPorCategoria(params: { mesNumero: number; anoPagamento: number; categoria: string }) {
  const { mesNumero, anoPagamento, categoria } = params;
  const res = await api.get("/gastos/por-categoria", { params: { mesNumero, anoPagamento, categoria } });
  return res.data as Gasto[];
}

export interface Gasto {
  id: number;
  mesPagamento: string;
  mesNumero: number;
  anoPagamento: number;
  descricao: string;
  categoria?: string | null;
  valor: number;
  pago: boolean;
  parcelaAtual?: number | null;
  totalParcelas?: number | null;
  referenteA?: string | null;
}

// Tipagem de página (compatível com Spring Pageable)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;  // página atual (0-based)
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Atualização parcial
export type AtualizacaoGastoDTO = Partial<Pick<Gasto, "pago" | "categoria" | "descricao" | "valor">>;

export async function atualizarGastoParcial(id: number, dto: AtualizacaoGastoDTO) {
  const res = await api.patch(`/gastos/${id}`, dto);
  return res.data as Gasto;
}

export async function excluirGasto(id: number) {
  await api.delete(`/gastos/${id}`);
}

// Criação de gasto manual
export interface CriarGastoDTO {
  mesNumero: number;
  anoPagamento: number;
  descricao: string;
  categoria: string; // backend exige @NotBlank
  valor: number;
  pago?: boolean;
  referenteA?: string | null;
  totalParcelas?: number | null;
  parcelaAtual?: number | null;
  mesPagamento?: string | null;
}

export async function criarGasto(dto: CriarGastoDTO) {
  const res = await api.post("/gastos/gastos", dto);
  return res.data as Gasto;
}
