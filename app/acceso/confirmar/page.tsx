import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // We await searchParams as per Next.js 14/15 requirements, 
  // even if not using them directly here.
  await searchParams
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session) {
    redirect("/acceso")
  }

  redirect("/plataforma")
}
