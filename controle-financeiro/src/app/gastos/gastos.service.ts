import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Gasto {
  id?: number;
  mes: string;
  categoria: string;
  valor: number;
  descricao?: string;
  pago?: boolean;
}

interface Receita {
  id?: number;
  mes: string;
  valor: number;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private baseUrl = 'http://localhost:8080/api';
  private headers = new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8'
  });

  constructor(private http: HttpClient) {}

  // Gastos
  criarGasto(gasto: Gasto): Observable<Gasto> {
    return this.http.post<Gasto>(
      `${this.baseUrl}/gastos`, 
      gasto, 
      { headers: this.headers }
    );
  }

  listarGastosPorMes(mes: string): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(
      `${this.baseUrl}/gastos/mes/${mes}`,
      { headers: this.headers }
    );
  }

  // Receitas
  criarReceita(receita: Receita): Observable<Receita> {
    return this.http.post<Receita>(
      `${this.baseUrl}/receitas`,
      receita,
      { headers: this.headers }
    );
  }

  listarReceitasPorMes(mes: string): Observable<Receita[]> {
    return this.http.get<Receita[]>(
      `${this.baseUrl}/receitas/mes/${mes}`,
      { headers: this.headers }
    );
  }

  // Resumo
  getResumoMensal(mes: string): Observable<{
    totalGastos: number,
    totalReceitas: number,
    saldo: number
  }> {
    return this.http.get<{
      totalGastos: number,
      totalReceitas: number,
      saldo: number
    }>(`${this.baseUrl}/resumo/${mes}`);
  }
}