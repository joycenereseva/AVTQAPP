-- Corrige políticas RLS que aceitavam owner_id IS NULL.
-- Rows com owner_id NULL ficam inacessíveis até serem atribuídas a um usuário.
-- Para atribuir, execute no SQL Editor:
--   UPDATE public.alunos SET owner_id = '<seu-user-uuid>' WHERE owner_id IS NULL;

drop policy if exists alunos_owner on public.alunos;
create policy alunos_owner on public.alunos
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists avaliacoes_owner on public.avaliacoes;
create policy avaliacoes_owner on public.avaliacoes
  for all using (
    exists (
      select 1 from public.alunos a
      where a.id = avaliacoes.aluno_id
        and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.alunos a
      where a.id = avaliacoes.aluno_id
        and a.owner_id = auth.uid()
    )
  );

drop policy if exists share_links_owner on public.share_links;
create policy share_links_owner on public.share_links
  for all using (
    exists (
      select 1 from public.avaliacoes av
      join public.alunos a on a.id = av.aluno_id
      where av.id = share_links.avaliacao_id
        and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.avaliacoes av
      join public.alunos a on a.id = av.aluno_id
      where av.id = share_links.avaliacao_id
        and a.owner_id = auth.uid()
    )
  );
