import { Component, OnInit } from '@angular/core';
import { FinanceiroService } from '../services/financeiro.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Papa from 'papaparse';
import { HttpClient } from '@angular/common/http';

interface Gasto {
  id?: number;
  mesPagamento: string;
  anoPagamento: number;
  referenteA: string;
  categoria: string;
  valor: number;
  descricao: string;
  pago?: boolean;
  parcelaAtual?: number;
  totalParcelas?: number;
}

interface Receita {
  id?: number;
  mes: string;
  valor: number;
  descricao: string;
}

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {
  mesSelecionado: string = '';
  anoSelecionado: number = new Date().getFullYear();
  meses: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  anos: number[] = [2024, 2025, 2026,2027, 2028, 2029, 2030];

  receitaMensal: number = 0;
  gastos: Gasto[] = [];
  receitas: Receita[] = [];
  resumo: any = {};
  categoriaCSVPadrao: string = 'Cartão de Crédito';

  novoGasto: Gasto = {
    mesPagamento: '',
    anoPagamento: new Date().getFullYear(),
    referenteA: '',
    categoria: '',
    valor: 0,
    descricao: ''
  };

  novaReceita: Receita = { mes: '', valor: 0, descricao: '' };
  gastosImportadosTemp: Gasto[] = [];

  loading = false;
  fieldErrors: any = {};
  gastoSelecionado: { [id: number]: boolean } = {};

  constructor(private financeiroService: FinanceiroService, private http: HttpClient) { }

  ngOnInit(): void {
  const dataAtual = new Date();
  this.mesSelecionado = this.meses[dataAtual.getMonth()];
  this.carregarDados();
}

  carregarDados(): void {
    this.loading = true;
    this.fieldErrors = {};
    this.financeiroService.listarGastosPorMes(this.mesSelecionado).subscribe({
      next: (data) => {
        this.gastos = data;
        this.carregarReceitas();
      },
      error: (err) => this.handleError(err)
    });
  }

  carregarReceitas(): void {
    this.financeiroService.listarReceitasPorMes(this.mesSelecionado).subscribe({
      next: (data) => {
        this.receitas = data;
        this.atualizarResumo();
      },
      error: (err) => this.handleError(err)
    });
  }

  atualizarResumo(): void {
  const totalGastos = this.gastos.reduce((sum, g) => sum + g.valor, 0);
  const totalReceitas = this.receitas.reduce((sum, r) => sum + r.valor, 0) + this.receitaMensal;
  this.resumo = {
    totalGastos,
    totalReceitas,
    saldo: totalReceitas - totalGastos
  };
  this.loading = false;
}

  validarGasto(): boolean {
    this.fieldErrors = {};
    let valido = true;
    if (!this.novoGasto.categoria) {
      this.fieldErrors.gasto_categoria = 'Selecione uma categoria';
      valido = false;
    }
    if (!this.novoGasto.valor || this.novoGasto.valor <= 0) {
      this.fieldErrors.gasto_valor = 'Digite um valor válido';
      valido = false;
    }
    return valido;
  }

  validarReceita(): boolean {
    this.fieldErrors = {};
    let valido = true;
    if (!this.novaReceita.descricao) {
      this.fieldErrors.receita_descricao = 'Descrição é obrigatória';
      valido = false;
    }
    if (!this.novaReceita.valor || this.novaReceita.valor <= 0) {
      this.fieldErrors.receita_valor = 'Digite um valor válido';
      valido = false;
    }
    return valido;
  }

  adicionarGasto(): void {
    if (!this.validarGasto()) return;
    this.loading = true;
    this.novoGasto.mesPagamento = this.mesSelecionado;
    this.novoGasto.anoPagamento = new Date().getFullYear();
    this.novoGasto.referenteA = this.mesSelecionado;
    this.financeiroService.criarGasto(this.novoGasto).subscribe({
      next: () => {
        this.carregarDados();
        this.resetarFormulario('gasto');
      },
      error: () => {
        this.fieldErrors.gasto_valor = 'Erro ao salvar. Tente novamente.';
        this.loading = false;
      }
    });
  }

  adicionarReceita(): void {
    if (!this.validarReceita()) return;
    this.loading = true;
    this.novaReceita.mes = this.mesSelecionado;
    this.financeiroService.criarReceita(this.novaReceita).subscribe({
      next: () => {
        this.carregarDados();
        this.resetarFormulario('receita');
      },
      error: () => {
        this.fieldErrors.receita_valor = 'Erro ao salvar. Tente novamente.';
        this.loading = false;
      }
    });
  }

  private resetarFormulario(tipo: 'gasto' | 'receita'): void {
    if (tipo === 'gasto') this.novoGasto = {
      mesPagamento: this.mesSelecionado,
      anoPagamento: new Date().getFullYear(),
      referenteA: this.mesSelecionado,
      categoria: '',
      valor: 0,
      descricao: ''
    };
    else this.novaReceita = { mes: this.mesSelecionado, valor: 0, descricao: '' };
    this.fieldErrors = {};
  }

  private handleError(error: any): void {
    console.error('Erro:', error);
    this.loading = false;
  }

  apagarGasto(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;
    this.loading = true;
    this.financeiroService.deletarGasto(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.handleError(err)
    });
  }

  apagarReceita(id: number): void {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    this.loading = true;
    this.financeiroService.deletarReceita(id).subscribe({
      next: () => this.carregarDados(),
      error: (err) => this.handleError(err)
    });
  }

  marcarPago(gasto: Gasto): void {
    this.loading = true;
    this.financeiroService.marcarComoPago(gasto.id!).subscribe({
      next: () => {
        gasto.pago = true;
        this.atualizarResumo();
      },
      error: (err) => this.handleError(err)
    });
  }

  onCSVSelecionado(event: any, inputCsv: HTMLInputElement): void {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (resultado: Papa.ParseResult<any>) => {
      const linhas = resultado.data as any[];
      this.gastosImportadosTemp = [];

      for (const linha of linhas) {
        const descricaoCompleta = linha.title;
        const valor = parseFloat(linha.amount);
        const dataOriginal = linha.date ? new Date(linha.date) : new Date();

        if (!descricaoCompleta || descricaoCompleta.toLowerCase().includes('pagamento recebido') || valor <= 0) continue;

        // Soma +1 mês ao pagamento (pagas com salário do mês seguinte)
        const dataPagamento = new Date(dataOriginal);
        dataPagamento.setMonth(dataPagamento.getMonth() + 1);
        const mesPagamento = dataPagamento.toLocaleString('pt-BR', { month: 'long' }).toLowerCase();
        const anoPagamento = dataPagamento.getFullYear();
        const referenteA = `${mesPagamento}/${anoPagamento}`;

        const parcelaRegex = /Parcela\s+(\d+)\s*\/\s*(\d+)/i;
        const match = descricaoCompleta.match(parcelaRegex);
        const descricaoLimpa = descricaoCompleta.replace(parcelaRegex, '').trim();

        if (match) {
          const parcelaInicial = parseInt(match[1], 10);
          const totalParcelas = parseInt(match[2], 10);

          for (let i = parcelaInicial; i <= totalParcelas; i++) {
            const novaData = new Date(dataPagamento);
            novaData.setMonth(novaData.getMonth() + (i - parcelaInicial));
            const mesParcela = novaData.toLocaleString('pt-BR', { month: 'long' }).toLowerCase();
            const anoParcela = novaData.getFullYear();
            const referenteAParcela = `${mesParcela}/${anoParcela}`;

            this.gastosImportadosTemp.push({
              descricao: descricaoLimpa,
              valor,
              categoria: this.categoriaCSVPadrao,
              mesPagamento: mesParcela,
              anoPagamento: anoParcela,
              referenteA: referenteAParcela,
              pago: i === parcelaInicial, // só a 1ª parcela vem marcada como paga
              parcelaAtual: i,
              totalParcelas
            });
          }
        } else {
          this.gastosImportadosTemp.push({
            descricao: descricaoLimpa,
            valor,
            categoria: this.categoriaCSVPadrao,
            mesPagamento,
            anoPagamento,
            referenteA,
            pago: false, // lançamentos únicos vêm não pagos
            parcelaAtual: undefined,
            totalParcelas: undefined
          });
        }
      }

      console.log('Prévia dos gastos importados:', this.gastosImportadosTemp);
      alert('CSV carregado com sucesso!');
      inputCsv.value = '';
    }
  });
}

  importarGastos(): void {
    if (this.gastosImportadosTemp.length === 0) return;
    this.http.post('http://localhost:8080/api/gastos/importar', this.gastosImportadosTemp).subscribe({
      next: () => {
        alert('Gastos importados com sucesso!');
        this.gastosImportadosTemp = [];
        this.carregarDados();
      },
      error: (err) => {
        console.error('Erro ao importar:', err);
        alert('Erro ao importar CSV.');
      }
    });
  }

  existeSelecionado(): boolean {
    return Object.values(this.gastoSelecionado).some(val => val);
  }

  deletarSelecionados(): void {
    const idsParaExcluir = Object.entries(this.gastoSelecionado)
      .filter(([_, selecionado]) => selecionado)
      .map(([id]) => Number(id));

    if (idsParaExcluir.length === 0) return;
    if (!confirm(`Deseja excluir ${idsParaExcluir.length} gasto(s)?`)) return;

    this.loading = true;
    let deletados = 0;

    idsParaExcluir.forEach(id => {
      this.financeiroService.deletarGasto(id).subscribe({
        next: () => {
          deletados++;
          if (deletados === idsParaExcluir.length) {
            this.gastoSelecionado = {};
            this.carregarDados();
          }
        },
        error: (err) => this.handleError(err)
      });
    });
  }

  selecionarTodosGastos(marcado: boolean): void {
  this.gastos.forEach(g => {
    if (g.id !== undefined) {
      this.gastoSelecionado[g.id] = marcado;
    }
  });
}

  despesasPorCategoria: { [categoria: string]: number } = {
  'Cartão de Crédito': 0,
  'Contas Fixas': 0,
  'Transporte': 0,
  'Moradia': 0,
  'Alimentação': 0,
  'Gastos Não Programados': 0
};

atualizarTotalDespesas(): void {
  const total = Object.values(this.despesasPorCategoria).reduce((sum, v) => sum + (v || 0), 0);
  this.resumo.totalGastos = total;
  this.resumo.saldo = this.resumo.totalReceitas - total;
}

salvarDadosCategoria(): void {
  alert('📌 Em breve: integração com backend para salvar gastos por categoria!');
}

obterCheckboxMarcado(event: Event): boolean {
  return (event.target as HTMLInputElement)?.checked ?? false;
}

}