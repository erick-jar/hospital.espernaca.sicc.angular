import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-senha',
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css'
})
export class RecuperarSenha {
  email = '';

  tentouEnviar = false;
  carregando = false;

  mensagemSucesso = '';

  constructor(private changeDetector: ChangeDetectorRef) {}

  emailValido(): boolean {
    const valor = this.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(valor);
  }

  enviarLink(): void {
    this.tentouEnviar = true;
    this.mensagemSucesso = '';

    if (!this.emailValido()) {
      return;
    }

    this.carregando = true;

    setTimeout(() => {
      this.carregando = false;
      this.mensagemSucesso =
        'As instruções para redefinir sua senha foram enviadas para o e-mail informado.';

      this.changeDetector.markForCheck();
    }, 1200);
  }
}