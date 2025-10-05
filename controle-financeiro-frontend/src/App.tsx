import { useEffect, useState } from "react";
import Header from "./components/Header";
import Card from "./components/ui/Card";
import EditableMoneyCard from "./components/EditableMoneyCard";
import CartaoCreditoResumo from "./components/CartaoCreditoResumo";
import { listarGastosPaginado, resumoMensal } from "./services/gastos";
import AddGastoModal from "./components/AddGastoModal";
import { buscarReceitaMensal, salvarReceitaMensal } from "./services/receitas";
import GastosTable from "./components/GastosTable";

export default function App() {
  const [mesNumero, setMesNumero] = useState<number>(new Date().getMonth() + 1);
  const [anoPagamento, setAnoPagamento] = useState<number>(new Date().getFullYear());

  const [receitaTotal, setReceitaTotal] = useState(0);
  const [despesaTotal, setDespesaTotal] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [receitaErro, setReceitaErro] = useState<string | null>(null);

  async function carregarResumo() {
    try {
      const r = await resumoMensal(mesNumero, anoPagamento);
      setDespesaTotal(r.total ?? 0);
      setError(null);
    } catch (e: any) {
      console.error("[ResumoMensal]", e?.response?.status, e?.response?.data || e?.message);
      setError(e?.response?.data || e?.message || "Falha ao carregar resumo.");
      setDespesaTotal(0);
    }
  }

  async function carregarGastos() {
    try {
      const page = await listarGastosPaginado({ mesNumero, anoPagamento, page: 0, size: 10 });
      console.log("Gastos paginados:", page);
      setError(null);
    } catch (e: any) {
      console.error("[GastosPaginado]", e?.response?.status, e?.response?.data || e?.message);
      setError(e?.response?.data || e?.message || "Falha ao carregar gastos.");
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setReceitaErro(null);
        const valor = await buscarReceitaMensal(anoPagamento, mesNumero);
        if (ativo) {
          setReceitaTotal(valor ?? 0);
        }
      } catch (e: any) {
        console.error("[ReceitaMensal]", e?.response?.status, e?.response?.data || e?.message);
        if (ativo) {
          setReceitaTotal(0);
        }
        setReceitaErro(e?.response?.data || e?.message || "Falha ao carregar receita.");
      }

      await Promise.all([carregarResumo(), carregarGastos()]);
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [mesNumero, anoPagamento]);

  async function salvarReceitaDoMes(novoValor: number) {
    const anterior = receitaTotal;
    setReceitaTotal(novoValor);
    try {
      await salvarReceitaMensal(anoPagamento, mesNumero, novoValor);
      setReceitaErro(null);
    } catch (e: any) {
      console.error("[ReceitaMensal][Salvar]", e?.response?.status, e?.response?.data || e?.message);
      setReceitaTotal(anterior);
      setReceitaErro(e?.response?.data || e?.message || "Falha ao salvar receita.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-100">
      <Header
        mesNumero={mesNumero}
        anoPagamento={anoPagamento}
        onChangeMes={setMesNumero}
        onChangeAno={setAnoPagamento}
        onImported={() => {
          carregarResumo();
          carregarGastos();
          setRefreshToken((x) => x + 1);
        }}
      />

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        {receitaErro && (
          <div className="rounded-lg bg-amber-900/30 text-amber-200 ring-1 ring-amber-700 px-4 py-2">
            Receita: {String(receitaErro)}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-900/30 text-red-200 ring-1 ring-red-800 px-4 py-2">
            Erro ao carregar dados: {String(error)}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EditableMoneyCard
            title="Receita Mensal"
            value={receitaTotal}
            onSave={salvarReceitaDoMes}
          />

          <Card
            variant="danger"
            title="Despesas (Total)"
            value={despesaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          />

          <Card
            variant="info"
            title="Saldo (Receita - Despesas)"
            value={(receitaTotal - despesaTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          />
        </div>

        <CartaoCreditoResumo
          mesNumero={mesNumero}
          anoPagamento={anoPagamento}
          refreshToken={refreshToken}
          onChanged={() => {
            carregarResumo();
          }}
        />

        <GastosTable
          mesNumero={mesNumero}
          anoPagamento={anoPagamento}
          excludeCategoria="Cartão de Crédito"
          refreshToken={refreshToken}
          onAddNew={() => setAddOpen(true)}
        />
      </main>

      <AddGastoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mesNumero={mesNumero}
        anoPagamento={anoPagamento}
        onCreated={() => {
          carregarResumo();
          carregarGastos();
          setRefreshToken((x) => x + 1);
        }}
      />
    </div>
  );
}
