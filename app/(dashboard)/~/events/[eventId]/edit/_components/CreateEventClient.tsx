"use client"

// ─────────────────────────────────────────────────────────────────────────────
// app/~/events/[eventId]/edit/_components/CreateEventClient.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Save,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { EventSettingsForm, InitialEventData, EventType } from "../../actions"

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "workshop", label: "Workshop" },
  { value: "hackathon", label: "Hackathon" },
  { value: "webinar", label: "Webinar" },
  { value: "bootcamp", label: "Bootcamp" },
]

// ─── Timezone helpers (mirrors SettingsForm in tests) ─────────────────────────

export function toLocalDateTimeInput(isoString: string): string {
  if (!isoString) return ""
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(isoString)) return isoString
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const offsetMs = d.getTimezoneOffset() * 60 * 1000
  const localDate = new Date(d.getTime() - offsetMs)
  return localDate.toISOString().slice(0, 16)
}

export function toUTCISOString(localDT: string): string {
  if (!localDT) return ""
  const d = new Date(localDT)
  if (isNaN(d.getTime())) return ""
  return d.toISOString()
}

export function normalizeDefaults(values: EventSettingsForm): EventSettingsForm {
  return {
    ...values,
    start_time: toLocalDateTimeInput(values.start_time),
    end_time: toLocalDateTimeInput(values.end_time),
  }
}

function settingsForDb(settings: EventSettingsForm): EventSettingsForm {
  return {
    ...settings,
    start_time: toUTCISOString(settings.start_time),
    end_time: toUTCISOString(settings.end_time),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  eventId?: string
  initialData?: InitialEventData
  onSaveDraft: (eventId: string, settings: EventSettingsForm, status: "draft" | "published") => Promise<string>
  onPublish: (eventId: string, settings: EventSettingsForm) => Promise<void>
}

export function CreateEventClient({
  eventId,
  initialData,
  onSaveDraft,
  onPublish,
}: Props) {
  const router = useRouter()
  const isEditMode = eventId !== undefined
  const isNew = !eventId

  const [settings, setSettings] = useState<EventSettingsForm>(() => {
    if (initialData) {
      return normalizeDefaults(initialData.settings)
    }
    return {
      title: "",
      description: "",
      speaker: "",
      start_time: "",
      end_time: "",
      venue: "",
      meeting_link: "",
      event_type: "",
    }
  })

  const [isSaving, startSaveTransition] = useTransition()
  const [isPublishing, startPublishTransition] = useTransition()

  const update = (field: keyof EventSettingsForm, value: string) => {
    setSettings((prev: EventSettingsForm) => ({ ...prev, [field]: value }))
  }

  // Validation helpers (matching the test page logic)
  const titleValid = settings.title.trim().length > 0
  const dateRangeValid =
    !settings.start_time ||
    !settings.end_time ||
    settings.start_time < settings.end_time

  const canSave = titleValid && dateRangeValid

  const handleSaveDraft = () => {
    if (!canSave) {
      if (!titleValid) toast.error("Title is required to save.")
      return
    }

    startSaveTransition(async () => {
      try {
        const id = await onSaveDraft(eventId ?? "new", settingsForDb(settings), "draft")
        toast.success(isNew ? "Event created as draft" : "Draft saved")
        if (isNew) {
          router.replace(`/~/events/${id}/edit`)
        }
      } catch (err: any) {
        toast.error(err.message ?? "Failed to save")
      }
    })
  }

  const handlePublish = () => {
    if (!canSave) {
      if (!titleValid) toast.error("Title is required to publish.")
      return
    }
    if (!settings.start_time) {
      toast.error("Start time is required.")
      return
    }
    if (!settings.end_time) {
      toast.error("End time is required.")
      return
    }
    if (!settings.event_type) {
      toast.error("Event type is required.")
      return
    }

    startPublishTransition(async () => {
      try {
        await onPublish(eventId ?? "new", settingsForDb(settings))
        toast.success("Event published!")
      } catch (err: any) {
        toast.error(err.message ?? "Failed to publish")
      }
    })
  }

  const isPending = isSaving || isPublishing

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto space-y-6 px-4 py-6 md:px-6 md:py-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight">
              {isEditMode ? "Edit Event" : "Create Event"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update event details, then republish."
                : "Fill in event details, then publish."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || !canSave}
              onClick={handleSaveDraft}
            >
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Draft
            </Button>

            <Button
              size="sm"
              disabled={isPending || !canSave}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Publish
            </Button>
          </div>
        </div>

        {/* ── Settings Form Card ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Event Settings</CardTitle>
            <CardDescription>Basic information about this event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Web Development Workshop"
                value={settings.title}
                onChange={(e) => update("title", e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the event..."
                className="min-h-[4rem] resize-none"
                value={settings.description}
                onChange={(e) => update("description", e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Event Type + Speaker */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="event_type">Event Type <span className="text-destructive">*</span></Label>
                <Select
                  value={settings.event_type}
                  onValueChange={(v) => update("event_type", v)}
                  disabled={isPending}
                >
                  <SelectTrigger id="event_type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="speaker">Speaker</Label>
                <Input
                  id="speaker"
                  placeholder="e.g. John Doe"
                  value={settings.speaker}
                  onChange={(e) => update("speaker", e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Start Time + End Time */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start_time">Start Time <span className="text-destructive">*</span></Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={settings.start_time}
                  onChange={(e) => update("start_time", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_time">End Time <span className="text-destructive">*</span></Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={settings.end_time}
                  onChange={(e) => update("end_time", e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Venue + Meeting Link */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="e.g. Room 204, Main Hall"
                  value={settings.venue}
                  onChange={(e) => update("venue", e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={settings.meeting_link}
                  onChange={(e) => update("meeting_link", e.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Date range validation warning */}
            {!dateRangeValid && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                &quot;End Time&quot; must be after &quot;Start Time&quot;.
              </p>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
