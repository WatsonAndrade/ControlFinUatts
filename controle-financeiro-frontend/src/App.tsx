import { useEffect, useState } from "react";
import Header from "./components/Header";
import Card from "./components/ui/Card";
import EditableMoneyCard from "./components/EditableMoneyCard";
import CartaoCreditoResumo from "./components/CartaoCreditoResumo";
import { listarGastosPaginado, resumoMensal } from "./services/gastos";
import AddGastoModal from "./components/AddGastoModal";
import { getReceita, setReceita } from "./utils/receitaStorage";
import GastosTable from "./components/GastosTable";

export default function App() {
  const [mesNumero, setMesNumero] = useState<number>(new Date().getMonth() + 1);
  const [anoPagamento, setAnoPagamento] = useState<number>(new Date().getFullYear());

  const [receitaTotal, setReceitaTotal] = useState(0);   // manual (localStorage por mÃªs/ano)
  const [despesaTotal, setDespesaTotal] = useState(0);   // da API (gastos)
  const [addOpen, setAddOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function carregarResumo() {
    try {
      const r = await resumoMensal(mesNumero, anoPagamento); // retorna resumo de GASTOS
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

  // ao mudar mÃªs/ano: carrega receita do storage e dados do backend
  useEffect(() => {
    setReceitaTotal(getReceita(anoPagamento, mesNumero));
    carregarResumo();
    carregarGastos();
  }, [mesNumero, anoPagamento]);

  function salvarReceitaDoMes(novoValor: number) {
    setReceitaTotal(novoValor);
    setReceita(anoPagamento, mesNumero, novoValor);
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-100 overflow-x-hidden">
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

      <main className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
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

        {/* Resumo de CartÃ£o de CrÃ©dito com opÃ§Ã£o de detalhar */}
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
          excludeCategoria="CartÃ£o de CrÃ©dito"
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


