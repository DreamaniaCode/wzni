import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const jar = await cookies();
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(name, item));
    else if (value !== undefined) query.append(name, value);
  }
  const locale = jar.get("wzni_locale")?.value === "ar" ? "/ar" : "/fr";
  redirect(locale + (query.size ? "?" + query.toString() : ""));
}
