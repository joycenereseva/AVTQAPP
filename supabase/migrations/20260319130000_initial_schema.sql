-- Avaliação Técnica — Natação Particular (Prof.ª Joyce Neres)
-- Execute via Supabase CLI: supabase db push

create extension if not exists "pgcrypto";

-- Perfis da professora
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Alunos
create table public.students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  birth_date date,
  photo_path text,
  schedule text,
  classes_start_date date,
  guardian_name text,
  guardian_phone text,
  admin_notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  modelo text not null default 'avancado' check (modelo in ('infantil', 'avancado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_owner_id_idx on public.students (owner_id);
create index students_owner_name_idx on public.students (owner_id, full_name);

-- Avaliações
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  reference_month text not null,
  assessment_date date not null,
  status text not null default 'draft' check (status in ('draft', 'finalized', 'superseded')),
  modelo text not null check (modelo in ('infantil', 'avancado')),
  skills jsonb not null default '{}'::jsonb,
  probe_nao_incluso boolean not null default false,
  probe_rows jsonb not null default '[]'::jsonb,
  probe_total text,
  gallahue text,
  morgana text,
  desenvolturas jsonb not null default '[]'::jsonb,
  dificuldades jsonb not null default '[]'::jsonb,
  meta text,
  consideracoes text,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessments_student_id_idx on public.assessments (student_id);
create index assessments_owner_id_idx on public.assessments (owner_id);
create index assessments_status_idx on public.assessments (student_id, status);

-- Links públicos (somente hash do token)
create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index share_links_assessment_id_idx on public.share_links (assessment_id);

-- Auditoria de alterações em avaliações finalizadas
create table public.assessment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  changed_by uuid not null references auth.users (id) on delete cascade,
  change_type text not null,
  snapshot_before jsonb,
  snapshot_after jsonb,
  created_at timestamptz not null default now()
);

-- Perfil automático ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger students_updated_at before update on public.students
  for each row execute function public.set_updated_at();
create trigger assessments_updated_at before update on public.assessments
  for each row execute function public.set_updated_at();

-- Relatório público por token (security definer — não expõe tabela inteira)
create or replace function public.get_public_report(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_link public.share_links%rowtype;
  v_assessment public.assessments%rowtype;
  v_student public.students%rowtype;
  v_profile public.profiles%rowtype;
  v_dates text[];
  v_photo_url text;
  v_settings jsonb;
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return null;
  end if;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  select * into v_link
  from public.share_links
  where token_hash = v_hash
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  limit 1;

  if not found then
    return null;
  end if;

  select * into v_assessment from public.assessments where id = v_link.assessment_id;
  if not found or v_assessment.status <> 'finalized' then
    return null;
  end if;

  select * into v_student from public.students where id = v_assessment.student_id;
  select * into v_profile from public.profiles where id = v_assessment.owner_id;

  select coalesce(array_agg(a.assessment_date::text order by a.assessment_date asc), '{}')
  into v_dates
  from public.assessments a
  where a.student_id = v_student.id
    and a.status = 'finalized';

  while array_length(v_dates, 1) is null or array_length(v_dates, 1) < 4 loop
    v_dates := array_append(v_dates, '—');
  end loop;
  v_dates := v_dates[1:4];

  v_settings := coalesce(v_profile.settings, '{}'::jsonb);
  v_photo_url := null;
  if v_student.photo_path is not null then
    v_photo_url := v_student.photo_path;
  end if;

  return jsonb_build_object(
    'config', jsonb_build_object(
      'nome', coalesce(v_settings->>'nome', 'Prof.ª Joyce Neres'),
      'tel', coalesce(v_settings->>'tel', ''),
      'cref', coalesce(v_settings->>'cref', ''),
      'email', coalesce(v_settings->>'email', ''),
      'logo_url', v_settings->>'logo_url'
    ),
    'student', jsonb_build_object(
      'nome', v_student.full_name,
      'birth_date', v_student.birth_date,
      'schedule', v_student.schedule,
      'modelo', v_student.modelo,
      'photo_url', v_photo_url
    ),
    'eval', jsonb_build_object(
      'id', v_assessment.id,
      'mes', v_assessment.reference_month,
      'data', v_assessment.assessment_date,
      'skills', v_assessment.skills,
      'probeNaoIncluso', v_assessment.probe_nao_incluso,
      'probeRows', v_assessment.probe_rows,
      'probeTotal', coalesce(v_assessment.probe_total, ''),
      'gallahue', coalesce(v_assessment.gallahue, ''),
      'morgana', coalesce(v_assessment.morgana, ''),
      'desenvolturas', v_assessment.desenvolturas,
      'dificuldades', v_assessment.dificuldades,
      'meta', coalesce(v_assessment.meta, ''),
      'consideracoes', coalesce(v_assessment.consideracoes, '')
    ),
    'avDates', to_jsonb(v_dates)
  );
end;
$$;

revoke all on function public.get_public_report(text) from public;
grant execute on function public.get_public_report(text) to anon, authenticated, service_role;

-- RLS
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.assessments enable row level security;
alter table public.share_links enable row level security;
alter table public.assessment_audit_logs enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "students_all_own" on public.students
  for all using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "assessments_all_own" on public.assessments
  for all using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "share_links_select_own" on public.share_links
  for select using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.owner_id = auth.uid()
    )
  );
create policy "share_links_insert_own" on public.share_links
  for insert with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.owner_id = auth.uid()
    )
  );
create policy "share_links_update_own" on public.share_links
  for update using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.owner_id = auth.uid()
    )
  );

create policy "audit_select_own" on public.assessment_audit_logs
  for select using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.owner_id = auth.uid()
    )
  );
create policy "audit_insert_own" on public.assessment_audit_logs
  for insert with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.owner_id = auth.uid()
    )
  );

-- Storage bucket (fotos) — políticas aplicadas no painel ou migration separada
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;

create policy "student_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'student-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "student_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'student-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "student_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'student-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "student_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'student-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Leitura pública de foto apenas via signed URL gerada no servidor (não via RLS anon)
