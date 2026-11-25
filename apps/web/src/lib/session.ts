/**
 * The signed-in customer, if any. Sign-in (phone OTP through Supabase Auth) arrives in prompt 04;
 * until then every visitor is signed out and "Save to my profile" asks them to sign in.
 */
export async function getSessionUserId(): Promise<string | null> {
  return null;
}
