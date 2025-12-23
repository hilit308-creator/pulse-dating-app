// frontend/src/services/analytics.ts
export type AnalyticsEvent =
  | "message_sent"
  | "message_deleted"
  | "call_started"
  | "call_ended"
  | "quick_action_selected"
  | "attachment_uploaded"
  | "voice_record_started"
  | "voice_record_stopped"
  | "voice_record_sent"
  | "chat_muted"
  | "chat_unmuted"
  | "user_blocked"
  | "user_unblocked"
  | "chat_cleared"
  | "chat_deleted"
  | "chat_reported"
  | "chat_theme_changed";

export async function track(event: AnalyticsEvent, payload: Record<string, any> = {}) {
  try {
    const device = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
    const appVersion = (window as any).__APP_VERSION__ || "0.1.0";

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload, device, appVersion }),
      keepalive: true,
    });
  } catch (e) {
    // non-blocking
    // console.warn("analytics failed", e);
  }
}
