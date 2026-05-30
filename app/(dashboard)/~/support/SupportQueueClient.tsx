"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { SearchIcon, ArrowRightIcon, HelpCircleIcon, RefreshCwIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateTicketStatusAction } from "@/app/help-center/actions";

interface SupportQueueClientProps {
  initialTickets: any[];
}

type TabType = "all" | "open" | "in_progress" | "resolved" | "closed";

export function SupportQueueClient({ initialTickets }: SupportQueueClientProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40";
      case "in_progress": return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40";
      case "resolved": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40";
      case "closed": return "bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800/40";
      default: return "bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800/40";
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: any) => {
    setUpdatingTicketId(ticketId);
    try {
      await updateTicketStatusAction(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      toast.success(`Ticket status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket status");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const refreshTickets = async () => {
    setIsRefreshing(true);
    try {
      // Re-fetch using standard fetch or dynamic update
      // Since this is a client component, we will trigger a reload from the router
      window.location.reload();
    } catch (err) {
      toast.error("Failed to refresh support queue.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and Search logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "all" || ticket.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const tabCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: "all", label: "All Tickets", count: tabCounts.all },
    { value: "open", label: "Open", count: tabCounts.open },
    { value: "in_progress", label: "In Progress", count: tabCounts.in_progress },
    { value: "resolved", label: "Resolved", count: tabCounts.resolved },
    { value: "closed", label: "Closed", count: tabCounts.closed },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground">Support Queue</h1>
          <p className="text-sm text-muted-foreground">Manage and resolve user support inquiries</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshTickets}
          disabled={isRefreshing}
          className="self-start gap-1.5 text-xs h-8"
        >
          <RefreshCwIcon className={cn("size-3.5", isRefreshing && "animate-spin")} />
          Refresh Queue
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-50/50 dark:bg-zinc-950/20 p-4 border rounded-2xl">
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5",
                activeTab === tab.value
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-sm"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"
              )}
            >
              {tab.label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[9px] font-bold border",
                activeTab === tab.value
                  ? "bg-zinc-800 text-zinc-100 border-zinc-700 dark:bg-zinc-100 dark:text-zinc-800 dark:border-zinc-200"
                  : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-750"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets, email..."
            className="pl-9 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-3xl py-16 text-center bg-white/50 dark:bg-zinc-950/20">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border text-muted-foreground">
            <InboxIcon className="size-6" />
          </div>
          <h3 className="text-base font-semibold">No tickets found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            There are no support tickets that match your current filters or query.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border bg-white dark:bg-zinc-950/50 overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {filteredTickets.map((ticket) => {
              const isUpdating = updatingTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 gap-4 hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-colors group"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">#{ticket.ticket_number}</span>
                      <span className="text-zinc-200 dark:text-zinc-800 text-[10px]">&bull;</span>
                      <span className="text-xs font-bold text-zinc-500 bg-zinc-100/80 dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                        {ticket.email}
                      </span>
                    </div>

                    <Link href={`/~/support/${ticket.id}`} className="block hover:underline underline-offset-2">
                      <h2 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {ticket.title}
                      </h2>
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      <span>Opened on {format(new Date(ticket.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="w-32">
                      <Select
                        value={ticket.status}
                        disabled={isUpdating}
                        onValueChange={(val) => handleStatusChange(ticket.id, val)}
                      >
                        <SelectTrigger className={cn("w-full h-8 text-[11px] font-semibold border-zinc-200/85 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg", getStatusColor(ticket.status))}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open" className="text-xs font-semibold">Open</SelectItem>
                          <SelectItem value="in_progress" className="text-xs font-semibold">In Progress</SelectItem>
                          <SelectItem value="resolved" className="text-xs font-semibold">Resolved</SelectItem>
                          <SelectItem value="closed" className="text-xs font-semibold">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1 rounded-lg shadow-sm" asChild>
                      <Link href={`/~/support/${ticket.id}`}>
                        Chat
                        <ArrowRightIcon className="size-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
