import {
  Component,
  EventEmitter,
  Output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  UsuarioAutenticado
} from '../../shared/services/auth';

@Component({
  selector: 'app-topbar',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  @Output() abrirMenu = new EventEmitter<void>();

  termoBusca = '';
  notificacoes = 3;

  menuPerfilAberto = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  solicitarAberturaMenu(): void {
    this.abrirMenu.emit();
  }

  obterUsuario(): UsuarioAutenticado | null {
    return this.authService.obterUsuarioAtual();
  }

  ehAdministrador(): boolean {
    return this.authService.ehAdministrador();
  }

  alternarMenuPerfil(): void {
    this.menuPerfilAberto.update(
      (menuAberto) => !menuAberto
    );
  }

  fecharMenuPerfil(): void {
    this.menuPerfilAberto.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.menuPerfilAberto.set(false);
    this.router.navigate(['/']);
  }

  buscar(): void {
    const termo = this.termoBusca.trim();

    if (!termo) {
      return;
    }

    console.log('Buscando por:', termo);
  }
}