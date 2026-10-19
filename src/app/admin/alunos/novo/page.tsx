import Link from "next/link";
import { StudentForm } from "@/components/students/StudentForm";

export default function NewStudentPage() {
  return (
    <div className="px-4 py-6">
      <Link href="/admin" className="mb-4 inline-block text-sm text-[var(--teal-dark)] hover:underline">
        ← Voltar
      </Link>
      <h1 className="font-brand mb-6 text-2xl font-bold text-[var(--teal-dark)]">Novo aluno</h1>
      <StudentForm />
    </div>
  );
}
