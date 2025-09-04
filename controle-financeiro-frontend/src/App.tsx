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

  const [receitaTotal, setReceitaTotal] = useState(0);   // manual (localStorage por mês/ano)
  const [despesaTotal, setDespesaTotal] = useState(0);   // da API (gastos)
  const saldo = receitaTotal - despesaTotal;
  const [addOpen, setAddOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  async function carregarResumo() {
    const r = await resumoMensal(mesNumero, anoPagamento); // retorna resumo de GASTOS
    setDespesaTotal(r.total);
  }

  async function carregarGastos() {
    const page = await listarGastosPaginado({ mesNumero, anoPagamento, page: 0, size: 10 });
    console.log("Gastos paginados:", page);
  }

  // ao mudar mês/ano: carrega receita do storage e dados do backend
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

        {/* Resumo de Cartão de Crédito com opção de detalhar */}
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
