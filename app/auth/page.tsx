/* eslint-disable react-doctor/nextjs-missing-metadata */
import { redirect } from "next/navigation"

export default function AuthenticationRoutePage() {
  redirect("/auth/login")
}