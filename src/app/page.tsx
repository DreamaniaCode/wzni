import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function Home() {
  const jar = await cookies();
  redirect(jar.get("wzni_locale")?.value === "ar" ? "/ar" : "/fr");
}
