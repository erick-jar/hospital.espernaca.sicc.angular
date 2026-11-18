import {Component,signal} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../../sidebar/sidebar';
import { Topbar } from '../../topbar/topbar';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Sidebar,
    Topbar
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  menuAberto = signal(false);

  abrirMenu(): void {
    this.menuAberto.set(true);
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }
}