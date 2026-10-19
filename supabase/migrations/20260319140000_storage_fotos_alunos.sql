-- Referência: bucket criado manualmente como `fotos-alunos`.
-- Execute apenas se ainda não tiver políticas equivalentes.

insert into storage.buckets (id, name, public)
values ('fotos-alunos', 'fotos-alunos', false)
on conflict (id) do nothing;

drop policy if exists "student_photos_select_own" on storage.objects;
drop policy if exists "student_photos_insert_own" on storage.objects;
drop policy if exists "student_photos_update_own" on storage.objects;
drop policy if exists "student_photos_delete_own" on storage.objects;

create policy "fotos_alunos_select_own" on storage.objects
  for select using (
    bucket_id = 'fotos-alunos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "fotos_alunos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'fotos-alunos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "fotos_alunos_update_own" on storage.objects
  for update using (
    bucket_id = 'fotos-alunos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "fotos_alunos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'fotos-alunos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
