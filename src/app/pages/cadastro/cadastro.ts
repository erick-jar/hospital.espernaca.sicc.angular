import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../shared/services/auth';
import { Colaboradores } from './colaboradores/colaboradores';
import { Epis } from './epis/epis';
import { Funcoes } from './funcoes/funcoes';

type TabCadastro = 'colaboradores' | 'epis' | 'funcoes';

@Component({
  selector: 'app-cadastro',
  imports: [Colaboradores, Epis, Funcoes],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  tabAtiva: TabCadastro = 'colaboradores';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const tabParam = this.route.snapshot.queryParamMap.get('tab') as TabCadastro | null;

    if (tabParam && this.tabPermitida(tabParam)) {
      this.tabAtiva = tabParam;
    } else if (!this.tabPermitida(this.tabAtiva)) {
      this.tabAtiva = this.podeVerEpisEFuncoes() ? 'epis' : 'colaboradores';
    }
  }

  podeVerColaboradores(): boolean {
    return this.authService.ehAdministrador() || this.authService.ehRH();
  }

  podeVerEpisEFuncoes(): boolean {
    return this.authService.ehAdministrador() || this.authService.ehTecnicoSeguranca();
  }

  tabPermitida(tab: TabCadastro): boolean {
    if (tab === 'colaboradores') {
      return this.podeVerColaboradores();
    }
    return this.podeVerEpisEFuncoes();
  }

  selecionarTab(tab: TabCadastro): void {
    if (!this.tabPermitida(tab)) {
      return;
    }

    this.tabAtiva = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }
}
