# 🏥 SICC - Sistema Interno de Cadastro e Controle

O **SICC (Sistema Interno de Cadastro e Controle)** é um sistema web desenvolvido para o **Hospital Esperança**, com o objetivo de centralizar o gerenciamento de colaboradores, EPIs, treinamentos e processos administrativos.

Este projeto foi desenvolvido como trabalho acadêmico utilizando **Angular** e **Bootstrap**, seguindo boas práticas de organização, componentização e controle de acesso por perfis de usuários.

---

## 📷 Demonstração

> Em breve serão adicionadas imagens do sistema.

---

## ✨ Funcionalidades implementadas

### 🔐 Autenticação

- Login por matrícula ou e-mail
- Validação de credenciais
- Recuperação de senha
- Logout seguro
- Controle de sessão

### 👤 Controle de usuários

- Perfil Administrador
- Perfil RH
- Perfil Técnico de Segurança

### 🔒 Controle de acesso

- Auth Guard
- Admin Guard
- Controle de permissões por perfil
- Restrições de acesso às configurações

### ⚙️ Configurações

- Gerenciamento de usuários
- Gerenciamento de perfis
- Gerenciamento de permissões
- Preferências do sistema

### 📱 Interface

- Dashboard moderno
- Sidebar responsiva
- Topbar interativa
- Menu de perfil
- Layout responsivo para desktop, tablet e celular

---

## 🚀 Tecnologias utilizadas

- Angular
- TypeScript
- HTML5
- CSS3
- Bootstrap 5
- Bootstrap Icons
- Git
- GitHub

---

## 📂 Estrutura do projeto

```
src/
│
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── layout/
│   │   ├── sidebar/
│   │   └── topbar/
│   │
│   ├── pages/
│   │   ├── login/
│   │   ├── recuperar-senha/
│   │   ├── dashboard/
│   │   └── configuracoes/
│   │
│   └── shared/
│       └── services/
│
└── assets/
```

---

## ▶️ Como executar o projeto

### Clone o repositório

```bash
git clone https://github.com/Cristiann6/hospital-esperanca-sicc.git
```

### Entre na pasta

```bash
cd hospital-esperanca-sicc
```

### Instale as dependências

```bash
npm install
```

### Execute o projeto

```bash
ng serve
```

Depois acesse:

```
http://localhost:4200
```

---

## 👨‍💻 Usuários para teste

### Administrador

| Campo | Valor |
|-------|-------|
| Matrícula | 1001 |
| E-mail | cristian@hospitalesperanca.com |
| Senha | admin123 |

### RH

| Campo | Valor |
|-------|-------|
| Matrícula | 1002 |
| E-mail | mariana@hospitalesperanca.com |
| Senha | rh123 |

### Técnico de Segurança

| Campo | Valor |
|-------|-------|
| Matrícula | 1003 |
| E-mail | carlos@hospitalesperanca.com |
| Senha | seg123 |

---

## 📌 Próximas funcionalidades

- Cadastro de colaboradores
- Gestão de EPIs
- Controle de estoque
- Treinamentos
- Relatórios
- Integração com banco de dados
- API REST

---

## 👥 Equipe

Projeto desenvolvido como atividade acadêmica.

---

## 📄 Licença

Projeto desenvolvido exclusivamente para fins educacionais.
