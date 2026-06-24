import { cookies } from "next/headers";

const COOKIE_NAME = "shiso_admin";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "shiso2024";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === getAdminPassword();
}

export { COOKIE_NAME };
