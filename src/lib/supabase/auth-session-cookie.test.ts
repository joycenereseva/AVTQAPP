import { describe, expect, it } from "vitest";
import { hasSupabaseAuthCookies, supabaseProjectRef } from "./auth-session-cookie";

describe("auth-session-cookie", () => {
  it("extrai project ref da URL", () => {
    expect(supabaseProjectRef("https://abcxyz.supabase.co")).toBe("abcxyz");
  });

  it("detecta cookie de sessão", () => {
    const url = "https://abcxyz.supabase.co";
    expect(
      hasSupabaseAuthCookies([{ name: "sb-abcxyz-auth-token", value: "x" }], url),
    ).toBe(true);
    expect(
      hasSupabaseAuthCookies([{ name: "sb-abcxyz-auth-token.0", value: "x" }], url),
    ).toBe(true);
    expect(hasSupabaseAuthCookies([], url)).toBe(false);
  });
});