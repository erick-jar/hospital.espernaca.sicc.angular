import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../shared/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() menuAberto = false;

  @Output()
  fecharMenuSolicitado = new EventEmitter<void>();

  constructor(
    private authService: AuthService
  ) {}

  fecharMenu(): void {
    this.fecharMenuSolicitado.emit();
  }

  ehAdministrador(): boolean {
    return this.authService.ehAdministrador();
  }

  ehRH(): boolean {
    return this.authService.ehRH();
  }

  podeVerColaboradores(): boolean {
    return this.authService.ehAdministrador() || this.authService.ehRH();
  }

  podeVerEpis(): boolean {
    return this.authService.ehAdministrador() || this.authService.ehTecnicoSeguranca();
  }
}