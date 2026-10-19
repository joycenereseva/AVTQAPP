import { createAdminClient } from "@/lib/supabase/admin";

export async function signedStudentPhotoUrl(
  photoPath: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!photoPath) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("student-photos")
      .createSignedUrl(photoPath, expiresIn);
    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
