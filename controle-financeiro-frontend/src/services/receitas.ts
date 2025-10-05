import { api } from "./api";

export type ReceitaMensalResponse = {
  ano: number;
  mes: number;
  valor: number;
};

export async function buscarReceitaMensal(ano: number, mes: number): Promise<number> {
  const { data } = await api.get<ReceitaMensalResponse>(`/receitas-mensais/${ano}/${mes}`);
  return data?.valor ?? 0;
}

export async function salvarReceitaMensal(ano: number, mes: number, valor: number): Promise<void> {
  await api.put(`/receitas-mensais/${ano}/${mes}`, { valor });
}
