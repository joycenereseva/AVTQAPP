# AVTQAPP — Avaliação Técnica · Natação Particular

Aplicação web (Next.js + Supabase) para gerenciar avaliações técnicas de natação infantil — **Prof.ª Joyce Neres**.

## Diagnóstico (Fase 1)

| Item | Situação |
|------|----------|
| Repositório `AVTQAPP` | Continha apenas `# AVTQAPP` — sem HTML/CSS/JS |
| Formulário de referência | Encontrado em [joycenereseva/AVFTQ](https://github.com/joycenereseva/AVFTQ) → copiado para `reference/` |
| Persistência anterior | `localStorage` + export JSON no HTML; versão Firebase opcional no AVFTQ |
| Compartilhamento anterior | Download de HTML standalone (`parent-page.js`), não link hospedado |

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Supabase (Auth, Postgres, Storage, RLS)
- PWA (`public/manifest.webmanifest`)
- Relatório público: `/avaliacao/[token]`

## Início rápido

Ver **[docs/SETUP.md](docs/SETUP.md)**.

```bash
npm install
cp .env.example .env.local
# configure Supabase e execute a migration SQL
npm run dev
```

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run lint` / `npm run typecheck` / `npm run test`

## Funcionalidades

### Concluídas no código

- Painel autenticado (alunos, busca, cadastro, arquivamento)
- Formulário espelhado (Infantil / Avançado, PROVA, textos pedagógicos)
- Rascunho, finalização, auditoria ao editar finalizada
- Histórico por aluno, comparação entre duas avaliações
- Relatório público mobile-first + tokens com hash SHA-256
- WhatsApp (mensagem pré-preenchida, envio manual)
- PDF via impressão do navegador
- PWA (manifest + ícones)
- Migration SQL com RLS e RPC `get_public_report`

### Pendentes até configurar infraestrutura

- Projeto Supabase real + usuário da professora
- Deploy Vercel e URL pública
- Testes manuais em Android/iOS e validação RLS em produção
- Evolução: revogação de link na UI, export/import JSON legado AVFTQ

## Licença / dados

Não utilize dados reais de crianças em demonstrações. Trate fotos e links conforme LGPD (ver nota em Configurações).
