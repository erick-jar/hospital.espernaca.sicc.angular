import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Cadastro } from './pages/cadastro/cadastro';
import { Dashboard } from './features/dashboard/dashboard';
import { Configuracoes } from './pages/configuracoes/configuracoes';
import { Estoque } from './pages/estoque/estoque';
import { Login } from './pages/login/login';
import { RecuperarSenha } from './pages/recuperar-senha/recuperar-senha';
import { GestaoDeEpis } from './pages/gestao-de-epis/gestao-de-epis';
import { Relatorio } from './pages/relatorio/relatorio';
import { Treinamentos } from './pages/treinamento/treinamento';

export const routes: Routes = [
  {
    path: '',
    component: Login
  },
  {
    path: 'recuperar-senha',
    component: RecuperarSenha
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'cadastro',
        component: Cadastro
      },
      {
        path: 'estoque',
        component: Estoque
      },
        {
        path: 'gestao-de-epis',
        component: GestaoDeEpis
      },
      {
        path: 'configuracoes',
        component: Configuracoes,
        canActivate: [adminGuard]
      },
      {
        path: 'treinamentos',
        component: Treinamentos
      },
      {
        path: 'relatorio',
        component: Relatorio
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];