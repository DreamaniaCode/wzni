export function isAdmin(
  id: string,
  allowlist = process.env.ADMIN_USER_IDS || "",
) {
  return (
    !!id &&
    allowlist
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .includes(id)
  );
}
