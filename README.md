# ✂️ BarberHub - Sistema SaaS para Barbearias

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/Vite-5.4.19-purple?logo=vite" alt="Vite Version" />
  <img src="https://img.shields.io/badge/Supabase-2.57.4-green?logo=supabase" alt="Supabase Version" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.17-cyan?logo=tailwindcss" alt="TailwindCSS Version" />
</div>

## 📋 Sobre o Projeto

O **BarberHub** é um sistema SaaS white-label completo para barbearias, focado em agendamento de serviços e gestão de equipe. O objetivo é criar um MVP funcional, escalável e com possibilidade de futuras integrações (notificações, pagamento online, domínios customizados).

## 🎯 Funcionalidades Principais

### 👑 Super Admin
- **Acesso**: `/super-admin` (sem login)
- **Funcionalidades**:
  - Cadastrar, editar e excluir barbearias
  - Gerar URLs exclusivas para cada barbearia (slug.seusistema.com)
  - Gerenciar todo o sistema

### 🏪 Admin da Barbearia
- **Acesso**: `/slug/admin` (sem login)
- **Funcionalidades**:
  - Gerenciar barbeiros, serviços, horários e agenda
  - Definir horário de funcionamento da barbearia
  - Bloquear horários específicos
  - Criar, editar e excluir clientes manualmente
  - Gerenciar serviços (nome, duração, preço)
  - Visualizar e gerenciar todos os agendamentos

### 👤 Cliente Final
- **Acesso**: URL da barbearia (slug.seusistema.com)
- **Funcionalidades**:
  - Cadastro/Login obrigatório
  - Agendar serviços com barbeiros
  - Ver histórico de agendamentos
  - Cancelar ou reagendar horários

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca principal
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 5.4.19** - Build tool e dev server
- **TailwindCSS 3.4.17** - Framework CSS
- **Shadcn/UI** - Componentes de interface
- **React Router** - Roteamento
- **Framer Motion** - Animações (opcional)

### Backend & Banco de Dados
- **Supabase 2.57.4** - Backend-as-a-Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Realtime - Atualizações em tempo real
  - Storage - Armazenamento de arquivos

### Infraestrutura
- **Cloudflare** - Wildcard subdomínios + SSL
- **Vercel** - Hospedagem do Next.js

## 🏗️ Arquitetura do Sistema

### Estrutura Multi-tenant
- Cada barbearia possui um subdomínio único
- Middleware para identificação automática da barbearia
- Isolamento de dados por tenant

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Header, Footer
│   └── ui/             # Componentes Shadcn/UI
├── hooks/              # Custom hooks
├── integrations/       # Integrações externas
│   └── supabase/       # Configuração Supabase
├── pages/              # Páginas da aplicação
│   ├── SuperAdmin.tsx  # Painel Super Admin
│   ├── BarbershopAdmin.tsx # Painel Admin Barbearia
│   └── BarbershopCustomer.tsx # Interface Cliente
├── utils/              # Utilitários
└── lib/                # Configurações
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/kbarber-hub.git

# Entre na pasta do projeto
cd kbarber-hub

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas credenciais do Supabase
```

### Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações do banco de dados
3. Configure as políticas de RLS (Row Level Security)
4. Atualize as variáveis de ambiente

### Executar em Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm run preview
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **barbershops** - Dados das barbearias
- **barbers** - Barbeiros de cada barbearia
- **services** - Serviços oferecidos
- **customers** - Clientes cadastrados
- **appointments** - Agendamentos
- **working_hours** - Horários de funcionamento
- **blocked_hours** - Horários bloqueados

## 🔧 Funcionalidades Implementadas

### ✅ MVP Atual
- [x] Sistema de autenticação com Supabase
- [x] Painel Super Admin para gerenciar barbearias
- [x] Interface de cliente para agendamentos
- [x] Sistema de subdomínios
- [x] Componentes UI responsivos
- [x] Estrutura multi-tenant

### 🚧 Em Desenvolvimento
- [ ] Painel Admin da Barbearia completo
- [ ] Sistema de agendamento inteligente
- [ ] Gestão de horários de funcionamento
- [ ] Sistema de bloqueio de horários
- [ ] Gestão de barbeiros e serviços

### 🔮 Futuras Funcionalidades
- [ ] Notificações via WhatsApp/Email
- [ ] Pagamentos online
- [ ] Domínios customizados (white-label completo)
- [ ] Aplicativo mobile
- [ ] Relatórios e analytics
- [ ] Sistema de avaliações

## 🌐 Configuração de Subdomínios

### Cloudflare
1. Configure um wildcard DNS: `*.seusistema.com`
2. Configure SSL automático
3. Configure redirecionamento para Vercel

### Vercel
1. Configure o domínio principal
2. Configure wildcard subdomínios
3. Configure middleware para detecção de subdomínio

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:
- 📧 Email: suporte@barberhub.com
- 💬 Discord: [Servidor do BarberHub](https://discord.gg/barberhub)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/kbarber-hub/issues)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Shadcn/UI](https://ui.shadcn.com) - Componentes de interface
- [TailwindCSS](https://tailwindcss.com) - Framework CSS
- [Vercel](https://vercel.com) - Hospedagem
- [Cloudflare](https://cloudflare.com) - CDN e DNS

---

<div align="center">
  <p>Desenvolvido com ❤️ para barbearias modernas</p>
  <p>© 2025 BarberHub. Todos os direitos reservados.</p>
</div>
