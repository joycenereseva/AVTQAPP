-- Extensões para o app AVTQAPP (rodar no SQL Editor do Supabase se ainda não existir)

alter table public.alunos
  add column if not exists modelo text not null default 'avancado' check (modelo in ('infantil', 'avancado')),
  add column if not exists status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  add column if not exists responsavel_nome text,
  add column if not exists observacoes_admin text,
  add column if not exists inicio_aulas date,
  add column if not exists owner_id uuid references auth.users (id) on delete cascade;

alter table public.avaliacoes
  add column if not exists status text not null default 'rascunho' check (status in ('rascunho', 'finalizada', 'substituida')),
  add column if not exists finalized_at timestamptz,
  add column if not exists dados_prova jsonb not null default '{}'::jsonb;

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references public.avaliacoes (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists share_links_avaliacao_id_idx on public.share_links (avaliacao_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.alunos enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.share_links enable row level security;
alter table public.profiles enable row level security;

drop policy if exists alunos_owner on public.alunos;
create policy alunos_owner on public.alunos
  for all using (owner_id is null or owner_id = auth.uid())
  with check (owner_id is null or owner_id = auth.uid());

drop policy if exists avaliacoes_owner on public.avaliacoes;
create policy avaliacoes_owner on public.avaliacoes
  for all using (
    exists (
      select 1 from public.alunos a
      where a.id = avaliacoes.aluno_id
        and (a.owner_id is null or a.owner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.alunos a
      where a.id = avaliacoes.aluno_id
        and (a.owner_id is null or a.owner_id = auth.uid())
    )
  );

drop policy if exists share_links_owner on public.share_links;
create policy share_links_owner on public.share_links
  for all using (
    exists (
      select 1 from public.avaliacoes av
      join public.alunos a on a.id = av.aluno_id
      where av.id = share_links.avaliacao_id
        and (a.owner_id is null or a.owner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.avaliacoes av
      join public.alunos a on a.id = av.aluno_id
      where av.id = share_links.avaliacao_id
        and (a.owner_id is null or a.owner_id = auth.uid())
    )
  );

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);
