import { api } from "./api";

export async function importCsvText(csvText: string) {
  const res = await api.post("/gastos/importar-csv", csvText, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  return res.data as { totalLidas: number; importadas: number; ignoradas: number };
}

export async function listarGastosPaginado(params: {
  mesNumero: number;
  anoPagamento: number;
  page?: number;
  size?: number;
  pago?: boolean;
}) {
  const { mesNumero, anoPagamento, page = 0, size = 10, pago } = params;
  const res = await api.get("/gastos/paginado", { params: { mesNumero, anoPagamento, page, size, pago } });
  return res.data;
}

export async function resumoPorCategoria(mesNumero: number, anoPagamento: number) {
  const res = await api.get("/gastos/resumo-por-categoria", { params: { mesNumero, anoPagamento } });
  return res.data;
}

export async function resumoMensal(mesNumero: number, anoPagamento: number) {
  const res = await api.get("/gastos/resumo", { params: { mesNumero, anoPagamento } });
  return res.data;
}
