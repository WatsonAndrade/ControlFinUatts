const key = (ano: number, mes: number) => `receita:${ano}-${String(mes).padStart(2, "0")}`;

export function getReceita(ano: number, mes: number): number {
  const v = localStorage.getItem(key(ano, mes));
  return v ? Number(v) : 0;
}

export function setReceita(ano: number, mes: number, valor: number) {
  localStorage.setItem(key(ano, mes), String(valor ?? 0));
}
