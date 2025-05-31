import { Routes } from '@angular/router';
import { GastosComponent } from './gastos/gastos.component';
import { ResumoAnualComponent } from './resumo-anual/resumo-anual.component';

export const routes: Routes = [
  { path: '', component: GastosComponent },
  { path: 'resumo', component: ResumoAnualComponent }
];