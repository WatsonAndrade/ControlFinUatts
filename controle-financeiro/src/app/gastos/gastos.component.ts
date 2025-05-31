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
  fieldErrors: {
    gasto_categoria?: string;
    gasto_valor?: string;
    receita_descricao?: string;
    receita_valor?: string;
  } = {};

  constructor(private financeiroService: FinanceiroService,
              ) {}            

  ngOnInit(): void {
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
    const totalGastos = this.gastos.reduce((sum, gasto) => sum + gasto.valor, 0);
    const totalReceitas = this.receitas.reduce((sum, receita) => sum + receita.valor, 0);

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
    this.novoGasto.mes = this.mesSelecionado;

    this.financeiroService.criarGasto(this.novoGasto).subscribe({
      next: () => {
        this.carregarDados();
        this.resetarFormulario('gasto');
      },
      error: (err) => {
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
      error: (err) => {
        this.fieldErrors.receita_valor = 'Erro ao salvar. Tente novamente.';
        this.loading = false;
      }
    });
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
      error: (err) => {
        this.handleError(err);
      }
    });
  }
}