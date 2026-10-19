import { createAdminClient } from "@/lib/supabase/admin";
import { STUDENT_PHOTOS_BUCKET } from "@/lib/supabase/storage";

export async function signedStudentPhotoUrl(
  photoPath: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!photoPath) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(STUDENT_PHOTOS_BUCKET)
      .createSignedUrl(photoPath, expiresIn);
    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
