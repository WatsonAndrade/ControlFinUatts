import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  criarGasto(gasto: any): Observable<any> {
 return this.http.post('http://localhost:8080/api/gastos', gasto, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

 listarGastosPorMes(mes: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/gastos/mes/${mes.toLowerCase()}`);
}

  // Receitas
  criarReceita(receita: any): Observable<any> {
   return this.http.post('http://localhost:8080/api/receitas', receita, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  }

  listarReceitasPorMes(mes: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/receitas/mes/${mes.toLowerCase()}`);
  }

  deletarGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/gastos/${id}`);
  }

 marcarComoPago(id: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/api/gastos/${id}/pago`, {});
}

  deletarReceita(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/api/receitas/${id}`);
}
}