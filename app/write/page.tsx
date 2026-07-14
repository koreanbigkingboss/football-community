import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import WriteForm from "./WriteForm";

export default async function WritePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/write");

  return <WriteForm />;
}
