import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * The Gap Audit is the product. The root sends visitors straight to it so a
 * single link works everywhere.
 */
export default function Home() {
  redirect("/audit");
}
