/* eslint-disable @typescript-eslint/no-explicit-any */
// app/~/events/_types.ts

export type DerivedCandidateEventStatus = "live" | "upcoming" | "past"
export type DerivedInstituteEventStatus = "draft" | "live" | "upcoming" | "past"

// ─── List-page types ──────────────────────────────────────────────────────────

export interface CandidateEvent {
    id: string
    title: string
    description?: string | null
    speaker?: string | null
    start_time: string
    end_time: string
    venue?: string | null
    meeting_link?: string | null
    event_type: string
    is_registered: boolean
    registered_at?: string | null
    derived_status: DerivedCandidateEventStatus
    current_derived_status?: DerivedCandidateEventStatus
}

export interface InstituteEvent {
    id: string
    title: string
    description?: string | null
    speaker?: string | null
    start_time: string
    end_time: string
    venue?: string | null
    meeting_link?: string | null
    event_type: string
    status: "draft" | "published"
    registration_count: number
    derived_status: DerivedInstituteEventStatus
    current_derived_status?: DerivedInstituteEventStatus
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function deriveStatus(startTime: string, endTime: string, now: Date): DerivedCandidateEventStatus {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const current = now.getTime()

    if (current < start) return "upcoming"
    if (current >= start && current <= end) return "live"
    return "past"
}

export function deriveInstituteEventStatus(dbStatus: string, startTime: string, endTime: string, nowOverride?: Date): DerivedInstituteEventStatus {
    if (dbStatus === "draft") return "draft"

    const now = nowOverride ?? new Date()
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const current = now.getTime()

    if (current < start) return "upcoming"
    if (current >= start && current <= end) return "live"
    return "past"
}