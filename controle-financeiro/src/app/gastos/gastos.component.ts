import { Component, OnInit } from '@angular/core';
import { FinanceiroService } from '../services/financeiro.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Gasto {
  id?: number;
  mes: string;
  categoria: string;
  valor: number;
  descricao: string;
  pago?: boolean;
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
  mesSelecionado: string = new Date().toLocaleString('pt-BR', { month: 'long' });
  meses: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  gastos: Gasto[] = [];
  receitas: Receita[] = [];
  resumo: any = {};

  novoGasto: Gasto = {
    mes: this.mesSelecionado,
    categoria: '',
    valor: 0,
    descricao: ''
  };

  novaReceita: Receita = {
    mes: this.mesSelecionado,
    valor: 0,
    descricao: ''
  };

  loading = false;
  errorMessage = '';

  constructor(private financeiroService: FinanceiroService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.financeiroService.listarGastosPorMes(this.mesSelecionado).subscribe({
        next: (data) => {
          this.gastos = data;
          this.atualizarResumo();
        },
        error: (err) => this.handleError(err)
      });

      this.financeiroService.listarReceitasPorMes(this.mesSelecionado).subscribe({
        next: (data) => {
          this.receitas = data;
          this.atualizarResumo();
        },
        //error: (err) => this.handleError(err)
      });

    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  atualizarResumo(): void {
    const totalGastos = this.gastos.reduce((sum, gasto) => sum + gasto.valor, 0);
    const totalReceitas = this.receitas.reduce((sum, receita) => sum + receita.valor, 0);

    this.resumo = {
      totalGastos,
      totalReceitas,
      saldo: totalReceitas - totalGastos
    };
  }

  adicionarGasto() {
  if (!this.novoGasto.categoria || this.novoGasto.valor <= 0) {
    this.errorMessage = 'Preencha a categoria e um valor positivo';
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  const dadosParaEnviar = {
    mes: this.mesSelecionado,
    categoria: this.novoGasto.categoria,
    valor: this.novoGasto.valor,
    descricao: this.novoGasto.descricao || ""
  };

  this.financeiroService.criarGasto(dadosParaEnviar).subscribe({
    next: (resposta) => {
      console.log('Sucesso!', resposta);
      this.carregarDados();
      this.novoGasto = {
        mes: this.mesSelecionado,
        categoria: '',
        valor: 0,
        descricao: ''
      };
    },
    error: (erro) => {
      console.error('Erro:', erro);
      this.errorMessage = 'Erro ao salvar. Tente novamente.';
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    }
  });
}

  adicionarReceita(): void {
    if (!this.validarFormulario(this.novaReceita)) return;
  
  this.novaReceita.mes = this.mesSelecionado;
  this.loading = true;

  this.financeiroService.criarReceita(this.novaReceita).subscribe({
    next: () => {
      this.carregarDados();
      this.resetarFormulario('receita');
    },
    error: (err) => {
      this.handleError(err);
      this.loading = false;
    },
    complete: () => {
      this.loading = false;
    }
  });
  }

  private validarFormulario(item: any): boolean {
    if (item.categoria && (!item.descricao || item.valor <= 0)) {
    this.errorMessage = 'Preencha todos os campos obrigatórios';
    return false;
  }
  // Validação para receitas
  if (!item.categoria && (!item.descricao || item.valor <= 0)) {
    this.errorMessage = 'Preencha todos os campos obrigatórios';
    return false;
  }
  return true;
  }

  private resetarFormulario(tipo: 'gasto' | 'receita'): void {
    if (tipo === 'gasto') {
      this.novoGasto = {
        mes: this.mesSelecionado,
        categoria: '',
        valor: 0,
        descricao: ''
      };
    } else {
      this.novaReceita = {
        mes: this.mesSelecionado,
        valor: 0,
        descricao: ''
      };
    }
  }

  private handleError(error: any): void {
    console.error('Erro:', error);
    this.errorMessage = 'Erro ao carregar dados. Tente novamente.';
    this.loading = false;
  }

  apagarGasto(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;

    this.loading = true;
    this.financeiroService.deletarGasto(id).subscribe({
      next: () => {
        this.carregarDados(); // Recarrega a lista
      },
      error: (err) => {
        this.handleError(err);
        this.loading = false;
      }
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
    next: (gastoAtualizado) => {
      gasto.pago = true;
      this.atualizarResumo();
    },
    error: (err) => {
      console.error('Erro completo:', err);
      this.errorMessage = 'Erro ao marcar como pago';
      this.loading = false;
    },
    complete: () => this.loading = false
  });
}

  
}