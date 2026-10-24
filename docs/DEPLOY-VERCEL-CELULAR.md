# Publicar na Vercel (3 passos) — abrir no celular

Use este guia se **https://avtqapp.vercel.app** mostra **404 NOT_FOUND** (página preta da Vercel).

## Passo 1 — Importar o projeto (1 clique + confirmar)

1. Abra **[vercel.com/new](https://vercel.com/new)** (logada na conta certa).
2. **Import Git Repository** → escolha **`joycenereseva/AVTQAPP`**.
3. **Project Name:** `avtqapp` (para bater com `avtqapp.vercel.app`).
4. **Framework Preset:** Next.js (detectado automaticamente).
5. **Root Directory:** deixe **vazio** (`.`).
6. **Não clique Deploy ainda** — vá ao passo 2.

## Passo 2 — Variáveis de ambiente (colar as 4)

Em **Environment Variables**, marque **Production** (e Preview se quiser):

| Nome | Onde pegar |
|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API → **publishable** / anon |
| `SUPABASE_SERVICE_ROLE_KEY` | API → **secret** / service_role (só servidor) |
| `NEXT_PUBLIC_APP_URL` | `https://avtqapp.vercel.app` |

Opcional: `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` = `fotos-alunos`

## Passo 3 — Deploy (1 clique)

1. Clique **Deploy**.
2. Aguarde status **Ready** (verde).
3. No celular abra: **https://avtqapp.vercel.app/login**

Se já existia um projeto vazio com o domínio:

- **Settings → Domains** → confirme `avtqapp.vercel.app` neste projeto.
- **Settings → Git** → conecte `AVTQAPP` / branch **`main`**.
- **Deployments → Redeploy** no último commit.

---

## No celular depois de publicado

| Quem | URL |
|------|-----|
| Professora | `https://avtqapp.vercel.app/login` |
| Responsável | link `https://avtqapp.vercel.app/avaliacao/TOKEN` |

**Instalar ícone (PWA):** Safari → Compartilhar → Adicionar à Tela de Início · Chrome → Instalar app.

---

## Deploy falhou?

Abra o deploy vermelho → **Building** → copie a última linha de erro.

Causas comuns já corrigidas no repo:

- Next.js vulnerável → repo usa **15.1.12** na `main`.
- Build local: `npm run build` na pasta do projeto.
