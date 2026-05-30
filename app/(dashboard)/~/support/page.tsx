import { getUserProfile } from "@/lib/supabase/profile"
import { redirect } from "next/navigation"
import { getMyTicketsAction } from "@/app/help-center/actions"
import { SupportQueueClient } from "./SupportQueueClient"

export default async function SupportQueuePage() {
  const profile = await getUserProfile()
  if (!profile || profile.account_type !== "admin") {
    redirect("/~/home")
  }

  const tickets = await getMyTicketsAction()

  return <SupportQueueClient initialTickets={tickets} />
}
