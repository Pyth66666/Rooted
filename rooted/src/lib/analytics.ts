type EventName =
  | "page_view"
  | "scan_clicked"
  | "upload_started"
  | "upload_completed"
  | "analysis_viewed"
  | "interest_yes"
  | "interest_maybe"
  | "interest_no"
  | "email_submitted"
  | "hair_concern_selected";

export function track(event: EventName, data?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };
  // Console for dev; replace with real endpoint later
  console.log("[ROOTED Analytics]", payload);
}
