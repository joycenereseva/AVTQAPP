-- Relatório público por token (schema avaliacoes/alunos) — executável via anon + RPC
create or replace function public.get_public_avaliacao_report(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_avaliacao_id uuid;
  v_av public.avaliacoes%rowtype;
  v_aluno public.alunos%rowtype;
  v_dates text[];
  v_dq jsonb;
  v_dp jsonb;
  v_probe_total text;
  v_finalizada boolean;
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return null;
  end if;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  select avaliacao_id into v_avaliacao_id
  from public.share_links
  where token_hash = v_hash
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  limit 1;

  if v_avaliacao_id is null then
    select id into v_avaliacao_id
    from public.avaliacoes
    where dados_qualitativos->>'share_token_hash' = v_hash
      and coalesce(dados_qualitativos->>'share_revoked_at', '') = ''
    limit 1;
  end if;

  if v_avaliacao_id is null then
    return null;
  end if;

  select * into v_av from public.avaliacoes where id = v_avaliacao_id;
  if not found then
    return null;
  end if;

  v_dq := coalesce(v_av.dados_qualitativos, '{}'::jsonb);
  v_dp := coalesce(v_av.dados_prova, '{}'::jsonb);
  v_finalizada :=
    (v_dq->>'status' = 'finalizada')
    or (v_av.status = 'finalizada');

  if not v_finalizada then
    return null;
  end if;

  select * into v_aluno from public.alunos where id = v_av.aluno_id;
  if not found then
    return null;
  end if;

  select coalesce(array_agg(a.data_avaliacao::text order by a.data_avaliacao asc), '{}')
  into v_dates
  from public.avaliacoes a
  where a.aluno_id = v_av.aluno_id
    and (
      coalesce(a.dados_qualitativos->>'status', '') = 'finalizada'
      or a.status = 'finalizada'
    );

  while array_length(v_dates, 1) is null or array_length(v_dates, 1) < 4 loop
    v_dates := array_append(v_dates, '—');
  end loop;
  v_dates := v_dates[1:4];

  v_probe_total := coalesce(
    nullif(v_dp->>'probe_total', ''),
    nullif(v_dq->>'probe_total', ''),
    ''
  );

  return jsonb_build_object(
    'config', jsonb_build_object(
      'nome', 'Prof.ª Joyce Neres',
      'tel', '(73) 9 9104-0064',
      'cref', '02260 - G',
      'email', 'joyceneresemp@gmail.com'
    ),
    'student', jsonb_build_object(
      'nome', regexp_replace(v_aluno.nome, '^\[INATIVO\] ', ''),
      'birth_date', v_aluno.data_nascimento,
      'schedule', trim(both ' ·' from concat_ws(
        ' · ',
        nullif(trim(v_aluno.turma_dias), ''),
        nullif(split_part(coalesce(v_aluno.turma_horario, ''), '__modelo:', 1), '')
      )),
      'modelo', coalesce(v_dq->>'modelo', v_aluno.modelo, 'avancado'),
      'photo_url', v_aluno.foto_url
    ),
    'eval', jsonb_build_object(
      'id', v_av.id,
      'mes', v_av.mes_referencia,
      'data', v_av.data_avaliacao,
      'skills', coalesce(v_dq->'skills', '{}'::jsonb),
      'probeNaoIncluso', coalesce((v_dp->>'probe_nao_incluso')::boolean, (v_dq->>'probe_nao_incluso')::boolean, false),
      'probeRows', coalesce(v_dp->'probe_rows', v_dq->'probe_rows', '[]'::jsonb),
      'probeTotal', v_probe_total,
      'gallahue', coalesce(v_av.classificacao_teorica, ''),
      'morgana', coalesce(v_av.estagio_aprendizagem, ''),
      'desenvolturas', coalesce(to_jsonb(v_av.desenvolturas), '[]'::jsonb),
      'dificuldades', coalesce(to_jsonb(v_av.dificuldades), '[]'::jsonb),
      'meta', coalesce(v_av.meta_proxima, ''),
      'consideracoes', coalesce(v_av.consideracoes_gerais, '')
    ),
    'avDates', to_jsonb(v_dates)
  );
end;
$$;

revoke all on function public.get_public_avaliacao_report(text) from public;
grant execute on function public.get_public_avaliacao_report(text) to anon, authenticated, service_role;
