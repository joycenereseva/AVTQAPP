# Configuração — Avaliação Técnica (AVTQAPP)

## 1. Supabase

1. Crie um projeto em [Supabase](https://supabase.com).
2. Em **SQL Editor**, execute o arquivo `supabase/migrations/20260319130000_initial_schema.sql` (ou use Supabase CLI: `supabase db push`).
3. Em **Authentication → Users**, crie o usuário da professora (e-mail + senha).
4. Confirme o bucket `student-photos` em **Storage** (criado pela migration).
5. Copie **Project URL** e **anon key** para `.env.local`.
6. Copie **service_role** apenas para variáveis de ambiente do servidor (Vercel), nunca para o cliente.

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

## 3. Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000/login`.

## 4. Deploy na Vercel

1. Importe o repositório `joycenereseva/AVTQAPP`.
2. Configure as mesmas variáveis de ambiente (incluindo `SUPABASE_SERVICE_ROLE_KEY`).
3. Defina `NEXT_PUBLIC_APP_URL` com a URL de produção.
4. Deploy.

## 5. PWA (Android / iOS)

- **Android (Chrome):** abra o painel `/admin` → menu do navegador → “Instalar aplicativo” ou “Adicionar à tela inicial”.
- **iPhone (Safari):** abra `/admin` → botão Compartilhar → “Adicionar à Tela de Início”.
- Relatórios públicos (`/avaliacao/TOKEN`) **não** exigem instalação.

## 6. Fluxo de uso

1. Login no painel.
2. **+ Novo aluno** → cadastro (foto opcional).
3. Abrir aluno → **+ Nova avaliação** → preencher critérios (modelo Infantil ou Avançado conforme cadastro).
4. **Salvar rascunho** ou **Finalizar avaliação**.
5. **Gerar / renovar link** → **Copiar link** ou **Compartilhar pelo WhatsApp** (a mensagem abre no WhatsApp; envio manual).
6. Responsável abre o link no celular — leitura em uma página rolável.

## 7. PDF

Use **Gerar PDF** na avaliação (abre relatório com botão **Imprimir / Salvar PDF** do navegador).

## 8. Revogar link

Ao gerar um novo link, os anteriores são revogados automaticamente. Para revogar sem substituir, use o painel Supabase (`share_links.revoked_at`) ou implemente o botão de revogação na UI (política RLS já permite update pela professora).

## 9. Referência do formulário

O formulário original está em `reference/avaliacao_natacao.html` (copiado do repositório [AVFTQ](https://github.com/joycenereseva/AVFTQ)). Critérios, siglas e seções foram espelhados em `src/lib/assessment-form.ts`.

## 10. Testes executados neste ambiente

| Verificação | Resultado |
|-------------|-----------|
| `npm run typecheck` | OK |
| `npm run lint` | OK |
| `npm run test` | OK (2 testes unitários — probe e NTNAV) |
| `npm run build` | OK (com variáveis placeholder) |

Testes de integração com Supabase, RLS, upload de foto, link público e dispositivos móveis reais dependem do projeto Supabase configurado e deploy — **não executados aqui** por falta de credenciais de produção.
