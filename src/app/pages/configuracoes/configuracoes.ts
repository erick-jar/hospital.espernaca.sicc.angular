import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../shared/api';
import { UsuarioService } from '../../shared/services/usuario';

type AbaConfiguracao =
  | 'usuarios'
  | 'perfis'
  | 'permissoes'
  | 'preferencias';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
}

interface Perfil {
  nome: string;
  descricao: string;
  permissoes: string[];
}

@Component({
  selector: 'app-configuracoes',
  imports: [FormsModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.css'
})
export class Configuracoes {
  abaAtiva: AbaConfiguracao = 'usuarios';

  perfilSelecionado = 'Administrador';

  termoBusca = '';

  mensagemSucesso = '';

  mensagemErro = '';

  // Usuários vindos do back end (GET /api/usuarios)
  usuarios: Usuario[] = [];

  perfis: Perfil[] = [
    {
      nome: 'Administrador',
      descricao: 'Acesso completo ao sistema e às configurações.',
      permissoes: [
        'Dashboard',
        'Colaboradores',
        'Gestão de EPIs',
        'Estoque',
        'Treinamentos',
        'Relatórios',
        'Configurações'
      ]
    },
    {
      nome: 'RH',
      descricao: 'Gerencia colaboradores e consultas administrativas.',
      permissoes: [
        'Dashboard',
        'Colaboradores'
      ]
    },
    {
      nome: 'Técnico de Segurança',
      descricao: 'Responsável pelos EPIs, estoque e treinamentos.',
      permissoes: [
        'Dashboard',
        'Gestão de EPIs',
        'Estoque',
        'Treinamentos',
        'Relatórios'
      ]
    }
  ];

  notificacaoEstoque = true;
  notificacaoValidade = true;
  notificacaoTreinamento = false;

  constructor(
    private usuarioService: UsuarioService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.carregarUsuarios();
  }

  private carregarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.mensagemErro = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  alterarAba(aba: AbaConfiguracao): void {
    this.abaAtiva = aba;
    this.mensagemSucesso = '';
  }

  abrirPermissoes(nomePerfil: string): void {
    this.perfilSelecionado = nomePerfil;
    this.abaAtiva = 'permissoes';
    this.mensagemSucesso = '';
  }

  perfilAtual(): Perfil | undefined {
    return this.perfis.find(
      (perfil) => perfil.nome === this.perfilSelecionado
    );
  }

  perfilPossuiPermissao(nomePermissao: string): boolean {
    return (
      this.perfilAtual()?.permissoes.includes(nomePermissao) ?? false
    );
  }

  alternarPermissao(nomePermissao: string): void {
    const perfil = this.perfilAtual();

    if (!perfil) {
      return;
    }

    const indice = perfil.permissoes.indexOf(nomePermissao);

    if (indice >= 0) {
      perfil.permissoes.splice(indice, 1);
    } else {
      perfil.permissoes.push(nomePermissao);
    }

    this.mensagemSucesso =
      `Permissões do perfil ${perfil.nome} atualizadas.`;
  }

  usuariosFiltrados(): Usuario[] {
    const busca = this.termoBusca.trim().toLowerCase();

    if (!busca) {
      return this.usuarios;
    }

    return this.usuarios.filter((usuario) =>
      usuario.nome.toLowerCase().includes(busca) ||
      usuario.email.toLowerCase().includes(busca) ||
      usuario.perfil.toLowerCase().includes(busca)
    );
  }

  alternarStatus(usuario: Usuario): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    // O back end grava a mudança e aplica as regras (ex.: não inativar o próprio usuário)
    this.usuarioService.alterarStatus(usuario.id, !usuario.ativo).subscribe({
      next: (atualizado) => {
        usuario.ativo = atualizado.ativo;

        this.mensagemSucesso = usuario.ativo
          ? 'Usuário ativado com sucesso.'
          : 'Usuário inativado com sucesso.';

        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.mensagemErro = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  salvarPreferencias(): void {
    this.mensagemSucesso = 'Preferências salvas com sucesso.';
  }
}