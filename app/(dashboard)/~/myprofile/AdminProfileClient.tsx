"use client"

import { useState, useTransition, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { UserProfile } from "@/lib/supabase/profile"
import { toast } from "sonner"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload, Loader2, Camera, CheckCircle2, XCircle, AtSign,
  Pencil, X, CheckCircle, Info, User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "unchanged"

interface Props {
  userProfile: UserProfile
  initialData: any
}

function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

function ReadonlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value?.trim() ? value : <span className="text-muted-foreground font-normal">-</span>}</p>
    </div>
  )
}

function getStorageUrl(supabase: ReturnType<typeof createClient>, bucket: string, path: string | null): string | null {
  if (!path) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  if (status === "checking") return <Loader2 className="size-4 animate-spin text-muted-foreground" />
  if (status === "available") return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === "taken" || status === "invalid") return <XCircle className="size-4 text-destructive" />
  return null
}

function usernameStatusMessage(status: UsernameStatus): { text: string; className: string } | null {
  if (status === "checking") return { text: "Checking availability…", className: "text-muted-foreground" }
  if (status === "available") return { text: "Username is available!", className: "text-emerald-600 dark:text-emerald-400" }
  if (status === "taken") return { text: "Username is already taken.", className: "text-destructive" }
  if (status === "invalid") return { text: "3–20 characters: letters, numbers, underscores only.", className: "text-destructive" }
  if (status === "unchanged") return { text: "This is your current username.", className: "text-muted-foreground" }
  return null
}

export function AdminProfileClient({ userProfile }: Props) {
  const supabase = createClient()
  const { refresh } = useRouter()
  const [isPending, startTransition] = useTransition()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [displayName, setDisplayName] = useState(userProfile.display_name ?? "")

  // Username status state
  const [username, setUsername] = useState(userProfile.username ?? "")
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle")
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialUsername = useRef(userProfile.username ?? "")

  // Avatar path state
  const storedAvatarPath = useRef<string | null>(userProfile.avatar_path ?? null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() =>
    getStorageUrl(supabase, "avatars", storedAvatarPath.current)
  )
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleUsernameChange(value: string) {
    const trimmed = value.trim()
    setUsername(trimmed)
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    if (!trimmed) { setUsernameStatus("idle"); return }
    if (trimmed === initialUsername.current) { setUsernameStatus("unchanged"); return }
    if (!USERNAME_REGEX.test(trimmed)) { setUsernameStatus("invalid"); return }
    setUsernameStatus("checking")
    usernameDebounceRef.current = setTimeout(async () => {
      const { data, error } = await (supabase as any).rpc("check_username_available", {
        p_username: trimmed,
        p_user_id: userProfile.id,
      })
      if (error) { setUsernameStatus("idle"); return }
      setUsernameStatus(data === true ? "available" : "taken")
    }, 500)
  }

  useEffect(() => {
    const timerRef = usernameDebounceRef
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function validateProfile() {
    const e: Record<string, string> = {}
    if (!displayName.trim()) e.displayName = "Display name is required."
    if (username && !USERNAME_REGEX.test(username)) e.username = "3–20 characters: letters, numbers, and underscores only."
    if (usernameStatus === "taken") e.username = "This username is already taken."
    if (usernameStatus === "checking") e.username = "Please wait for username availability check."
    return e
  }

  function handleSaveProfile() {
    const newErrors = validateProfile()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the validation errors before saving.")
      return
    }

    startTransition(async () => {
      try {
        const trimmedUsername = username.trim() || null
        const trimmedDisplayName = displayName.trim()

        const { error } = await supabase
          .from("profiles")
          .update({
            username: trimmedUsername,
            display_name: trimmedDisplayName,
          })
          .eq("id", userProfile.id)

        if (error) {
          if (error.code === "23505") {
            setErrors({ username: "This username is already taken." })
            setUsernameStatus("taken")
          } else {
            toast.error("Failed to update profile. Please try again.")
          }
          return
        }

        await supabase.auth.updateUser({
          data: {
            username: trimmedUsername,
            display_name: trimmedDisplayName,
          }
        })

        if (trimmedUsername) {
          initialUsername.current = trimmedUsername
          setUsernameStatus("unchanged")
        }

        toast.success("Profile updated successfully!")
        setErrors({})
        setIsEditingProfile(false)
        refresh()
      } catch (err: any) {
        console.error("Save error:", err)
        toast.error(err?.message || "Failed to save profile. Please try again.")
      }
    })
  }

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) { toast.error("Please upload a JPEG, PNG, or WEBP image."); return }
    if (file.size > MAX_IMAGE_SIZE_BYTES) { toast.error("Image must be smaller than 2 MB."); return }
    const blobUrl = URL.createObjectURL(file)
    setAvatarSrc(blobUrl)
    setIsUploadingAvatar(true)
    try {
      const oldPath = storedAvatarPath.current
      if (oldPath) await supabase.storage.from("avatars").remove([oldPath])
      const ext = file.name.split(".").pop() ?? "jpg"
      const timestamp = Date.now()
      const newPath = `admins/${userProfile.id}/avatar/${timestamp}.${ext}`
      
      const { error: uploadError } = await supabase.storage.from("avatars").upload(newPath, file, { upsert: false, contentType: file.type })
      if (uploadError) throw uploadError
      
      const { error: dbError } = await supabase.from("profiles").update({ avatar_path: newPath }).eq("id", userProfile.id)
      if (dbError) throw dbError
      
      await supabase.auth.updateUser({ data: { avatar_path: newPath } })
      storedAvatarPath.current = newPath
      const newPublicUrl = getStorageUrl(supabase, "avatars", newPath)
      setAvatarSrc(`${newPublicUrl}?v=${timestamp}`)
      URL.revokeObjectURL(blobUrl)
      toast.success("Avatar updated!")
      refresh()
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload avatar. Please try again.")
      setAvatarSrc(getStorageUrl(supabase, "avatars", storedAvatarPath.current))
      URL.revokeObjectURL(blobUrl)
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ""
    }
  }

  const usernameMsg = usernameStatusMessage(usernameStatus)
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : userProfile.email[0]?.toUpperCase() ?? "A"

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Admin Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal admin settings and profile details</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Avatar Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a custom avatar for your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="size-24 rounded-2xl border">
                  <AvatarImage src={avatarSrc ?? undefined} alt={displayName || "Admin Avatar"} className="object-cover" />
                  <AvatarFallback className="rounded-2xl text-2xl font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  aria-label="Change profile picture"
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isUploadingAvatar ? <Loader2 className="size-6 animate-spin text-white" /> : <Camera className="size-6 text-white" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarFileChange} aria-label="Upload avatar picture" />
              </div>
              <div className="space-y-1.5">
                <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar}>
                  <Upload className="mr-2 size-4" />{isUploadingAvatar ? "Uploading…" : "Upload Avatar"}
                </Button>
                <p className="text-xs text-muted-foreground">Square image recommended · max 2 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile details */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 gap-y-0">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your public and system identification details</CardDescription>
            </div>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Pencil className="size-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name<RequiredMark /></Label>
                  <Input
                    id="displayName"
                    placeholder="e.g. Administrator"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={errors.displayName ? "border-destructive" : ""}
                  />
                  <FieldError message={errors.displayName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="admin_username"
                      className={cn("pl-9 pr-9", errors.username && "border-destructive")}
                      value={username}
                      maxLength={20}
                      disabled={initialUsername.current !== ""}
                      onChange={(e) => handleUsernameChange(e.target.value.replace(/\s/g, ""))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <UsernameStatusIcon status={usernameStatus} />
                    </span>
                  </div>
                  {errors.username ? (
                    <FieldError message={errors.username} />
                  ) : usernameMsg ? (
                    <p className={cn("text-xs", usernameMsg.className)}>{usernameMsg.text}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {initialUsername.current !== "" 
                        ? "Username cannot be changed once set."
                        : "3–20 characters · letters, numbers, and underscores only · cannot be changed after saving"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userProfile.email} disabled className="bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Your account email cannot be changed.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <ReadonlyField label="Display Name" value={displayName} />
                <ReadonlyField label="Username" value={username ? `@${username}` : "Not set"} />
                <ReadonlyField label="Email" value={userProfile.email} />
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-0 hover:bg-red-100 font-semibold mt-0.5">
                    Administrator
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>

          {isEditingProfile && (
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="ghost" size="sm" onClick={() => {
                setDisplayName(userProfile.display_name ?? "");
                setUsername(userProfile.username ?? "");
                setUsernameStatus("idle");
                setErrors({});
                setIsEditingProfile(false);
              }} disabled={isPending}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={isPending}>
                {isPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
