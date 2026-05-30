"use client";

import React from "react";
import { format } from "date-fns";
import { SendIcon, ArrowLeftIcon, UserIcon, HeadphonesIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addTicketMessageAction, getTicketAction, updateTicketStatusAction } from "../../actions";
import { HeaderShell, Footer } from "../../page";
import { getUserProfileAction, type UserProfile } from "@/lib/supabase/profile";

export default function TicketChatClient({
  initialTicket,
  initialMessages,
  isDashboard = false,
}: {
  initialTicket: any;
  initialMessages: any[];
  isDashboard?: boolean;
}) {
  const [messages, setMessages] = React.useState(initialMessages);
  const [newMessage, setNewMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [ticketStatus, setTicketStatus] = React.useState(initialTicket.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getUserProfileAction();
        setUserProfile(profile);
      } catch (err) {
        console.error("Failed to load user profile in ticket chat:", err);
      }
    }
    fetchProfile();
  }, []);

  const isAdmin = userProfile?.account_type === "admin";

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await addTicketMessageAction(initialTicket.id, newMessage);
      setNewMessage("");
      const data = await getTicketAction(initialTicket.id);
      if (data) {
        setMessages(data.messages);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "open": return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40";
      case "in_progress": return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40";
      case "resolved": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40";
      case "closed": return "bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800/40";
      default: return "bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800/40";
    }
  }

  const allMessages = [
    {
      id: "initial",
      message: initialTicket.description,
      created_at: initialTicket.created_at,
      sender_type: "user",
      profiles: initialTicket.profiles,
    },
    ...messages
  ];

  if (isDashboard) {
    return (
      <div className="flex flex-col gap-6 px-4 py-8 md:px-8 w-full max-w-6xl mx-auto">
        <div className="mb-2">
          <Link href="/~/support" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4 group">
            <ArrowLeftIcon className="mr-1.5 size-4 transition-transform group-hover:-translate-x-1" />
            Back to Support Queue
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-50 dark:bg-zinc-900/40 p-4 md:p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                <h2 className="font-cirka text-xl sm:text-2xl font-semibold tracking-tight md:text-3xl truncate">Ticket #{initialTicket.ticket_number}</h2>
                <div className={cn("shrink-0 rounded-full px-2 md:px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border", getStatusColor(ticketStatus))}>
                  {ticketStatus.replace("_", " ")}
                </div>
              </div>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 font-medium break-words">
                {initialTicket.title}
              </p>
              <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-500 font-medium">
                <span>Opened on {format(new Date(initialTicket.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                {isAdmin && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-semibold bg-zinc-100 dark:bg-zinc-850 px-2.5 py-0.5 rounded-full">Creator: {initialTicket.email}</span>
                  </>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-48 mt-2 sm:mt-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">Update Status</span>
                <Select
                  value={ticketStatus}
                  disabled={isUpdatingStatus}
                  onValueChange={async (newStatus: any) => {
                    setIsUpdatingStatus(true);
                    try {
                      await updateTicketStatusAction(initialTicket.id, newStatus);
                      setTicketStatus(newStatus);
                      toast.success(`Ticket status updated to ${newStatus.replace("_", " ")}`);
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update ticket status");
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-xs font-semibold bg-white dark:bg-zinc-950 border-zinc-205 dark:border-zinc-800">
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
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl md:rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/40 overflow-hidden flex flex-col h-[calc(100vh-18rem)] md:h-[calc(100vh-16rem)] min-h-[450px] md:min-h-[500px] max-h-[850px] relative">
          
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none z-10" />

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8 bg-[#fafafa] dark:bg-[#0a0a0a]">
            {allMessages.map((msg, index) => {
              const isMyMessage = isAdmin ? msg.sender_type === "support" : msg.sender_type === "user";
              const showAvatar = index === 0 || allMessages[index - 1].sender_type !== msg.sender_type;

              return (
                <div key={msg.id} className={cn("flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%]", isMyMessage ? "ml-auto flex-row-reverse" : "mr-auto")}>
                  <div className="shrink-0 flex flex-col justify-end pb-1">
                    {showAvatar ? (
                      <Avatar className={cn("size-8 md:size-9 shadow-sm", isMyMessage ? "ring-2 ring-white dark:ring-black" : "ring-1 ring-zinc-200 dark:ring-zinc-800")}>
                        {msg.profiles?.avatar_path && (
                          <AvatarImage 
                            src={msg.profiles.avatar_path.startsWith('http') ? msg.profiles.avatar_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${msg.profiles.avatar_path}`} 
                            alt="User" 
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className={cn(isMyMessage ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" : "bg-black text-white dark:bg-white dark:text-black")}>
                          {msg.sender_type === "user" ? <UserIcon className="size-4" /> : <HeadphonesIcon className="size-4" />}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="size-8 md:size-9" />
                    )}
                  </div>

                  <div className={cn("flex flex-col gap-1.5", isMyMessage ? "items-end" : "items-start")}>
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mx-1.5">
                        <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                          {msg.sender_type === "user" ? (isAdmin ? "Customer" : "You") : (isAdmin ? "You (Support)" : "Support")}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {format(new Date(msg.created_at), "h:mm a")}
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      "px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all",
                      isMyMessage
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl rounded-br-sm md:rounded-3xl md:rounded-br-sm"
                        : "bg-white border border-zinc-200/60 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800/60 dark:text-zinc-100 rounded-2xl rounded-bl-sm md:rounded-3xl md:rounded-bl-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          <div className="p-4 md:p-6 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 z-20">
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 md:gap-3 max-w-6xl mx-auto">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-[50px] md:min-h-[60px] max-h-[120px] md:max-h-[200px] w-full resize-none rounded-2xl pr-12 md:pr-14 py-3 md:py-4 px-4 md:px-5 border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 focus-visible:bg-white dark:focus-visible:bg-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-white text-[14px] md:text-[15px] transition-all shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || isSubmitting}
                className="absolute right-1.5 md:right-2 bottom-1.5 md:bottom-2 size-9 md:size-11 rounded-xl shadow-sm transition-all active:scale-95 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
              >
                <SendIcon className="size-4 md:size-5 ml-0.5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="flex justify-between items-center mt-3 px-2 max-w-6xl mx-auto w-full">
              <p className="text-[11px] text-zinc-500 font-medium">
                {isSubmitting ? "Sending..." : "Press Enter to send"}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <HeaderShell />

      <section className="bg-white text-zinc-950 dark:bg-black dark:text-white pt-20 pb-8 md:pt-32 md:pb-20 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="mb-6 md:mb-8">
            <Link href="/help-center" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4 md:mb-6 group">
              <ArrowLeftIcon className="mr-1.5 size-4 transition-transform group-hover:-translate-x-1" />
              Back to Help Center
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-50 dark:bg-zinc-900/40 p-4 md:p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <h2 className="font-cirka text-xl sm:text-2xl font-semibold tracking-tight md:text-3xl truncate">Ticket #{initialTicket.ticket_number}</h2>
                  <div className={cn("shrink-0 rounded-full px-2 md:px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border", getStatusColor(ticketStatus))}>
                    {ticketStatus.replace("_", " ")}
                  </div>
                </div>
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 font-medium break-words">
                  {initialTicket.title}
                </p>
                <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-500 font-medium">
                  <span>Opened on {format(new Date(initialTicket.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                  {isAdmin && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                      <span className="text-zinc-600 dark:text-zinc-400 font-semibold bg-zinc-100 dark:bg-zinc-850 px-2.5 py-0.5 rounded-full">Creator: {initialTicket.email}</span>
                    </>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-48 mt-2 sm:mt-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">Update Status</span>
                  <Select
                    value={ticketStatus}
                    disabled={isUpdatingStatus}
                    onValueChange={async (newStatus: any) => {
                      setIsUpdatingStatus(true);
                      try {
                        await updateTicketStatusAction(initialTicket.id, newStatus);
                        setTicketStatus(newStatus);
                        toast.success(`Ticket status updated to ${newStatus.replace("_", " ")}`);
                      } catch (err: any) {
                        toast.error(err.message || "Failed to update ticket status");
                      } finally {
                        setIsUpdatingStatus(false);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-9 text-xs font-semibold bg-white dark:bg-zinc-950 border-zinc-205 dark:border-zinc-800">
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
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl md:rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/40 overflow-hidden flex flex-col h-[calc(100vh-16rem)] md:h-[calc(100vh-14rem)] min-h-[450px] md:min-h-[500px] max-h-[850px] relative">
            
            {/* Ambient top shadow for depth */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none z-10" />

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8 bg-[#fafafa] dark:bg-[#0a0a0a]">
              {allMessages.map((msg, index) => {
                const isMyMessage = isAdmin ? msg.sender_type === "support" : msg.sender_type === "user";
                const showAvatar = index === 0 || allMessages[index - 1].sender_type !== msg.sender_type;

                return (
                  <div key={msg.id} className={cn("flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%]", isMyMessage ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    <div className="shrink-0 flex flex-col justify-end pb-1">
                      {showAvatar ? (
                        <Avatar className={cn("size-8 md:size-9 shadow-sm", isMyMessage ? "ring-2 ring-white dark:ring-black" : "ring-1 ring-zinc-200 dark:ring-zinc-800")}>
                          {msg.profiles?.avatar_path && (
                            <AvatarImage 
                              src={msg.profiles.avatar_path.startsWith('http') ? msg.profiles.avatar_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${msg.profiles.avatar_path}`} 
                              alt="User" 
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className={cn(isMyMessage ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" : "bg-black text-white dark:bg-white dark:text-black")}>
                            {msg.sender_type === "user" ? <UserIcon className="size-4" /> : <HeadphonesIcon className="size-4" />}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="size-8 md:size-9" />
                      )}
                    </div>

                    <div className={cn("flex flex-col gap-1.5", isMyMessage ? "items-end" : "items-start")}>
                      {showAvatar && (
                        <div className="flex items-baseline gap-2 mx-1.5">
                          <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                            {msg.sender_type === "user" ? (isAdmin ? "Customer" : "You") : (isAdmin ? "You (Support)" : "Support")}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      )}
                      <div className={cn(
                        "px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all",
                        isMyMessage
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl rounded-br-sm md:rounded-3xl md:rounded-br-sm"
                          : "bg-white border border-zinc-200/60 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800/60 dark:text-zinc-100 rounded-2xl rounded-bl-sm md:rounded-3xl md:rounded-bl-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            <div className="p-4 md:p-6 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 z-20">
              <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 md:gap-3 max-w-6xl mx-auto">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[50px] md:min-h-[60px] max-h-[120px] md:max-h-[200px] w-full resize-none rounded-2xl pr-12 md:pr-14 py-3 md:py-4 px-4 md:px-5 border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 focus-visible:bg-white dark:focus-visible:bg-zinc-950 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-white text-[14px] md:text-[15px] transition-all shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSubmitting}
                  className="absolute right-1.5 md:right-2 bottom-1.5 md:bottom-2 size-9 md:size-11 rounded-xl shadow-sm transition-all active:scale-95 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
                >
                  <SendIcon className="size-4 md:size-5 ml-0.5" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
              <div className="flex justify-between items-center mt-3 px-2 max-w-6xl mx-auto w-full">
                <p className="text-[11px] text-zinc-500 font-medium">
                  {isSubmitting ? "Sending..." : "Press Enter to send"}
                </p>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Shift + Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
