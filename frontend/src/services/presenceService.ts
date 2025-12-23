// frontend/src/services/presenceService.ts

type PresenceUpdate = { userId: number; isOnline: boolean; lastSeenIso?: string };

type TypingEvent = { chatId: number; userId: number; isTyping: boolean };

export class PresenceService {
  private ws?: WebSocket;
  private url: string;
  private token: string;
  private backoff = 1000;
  private presenceHandlers: Array<(u: PresenceUpdate) => void> = [];
  private typingHandlers: Array<(t: TypingEvent) => void> = [];

  constructor(url = "wss://api.example.com/presence", token = "") {
    this.url = url;
    this.token = token;
  }

  connect() {
    const sep = this.url.includes("?") ? "&" : "?";
    const wsUrl = this.token ? `${this.url}${sep}token=${encodeURIComponent(this.token)}` : this.url;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.backoff = 1000;
    };
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'presence:update') this.presenceHandlers.forEach(h => h(msg.payload as PresenceUpdate));
        if (msg?.type === 'typing') this.typingHandlers.forEach(h => h(msg.payload as TypingEvent));
      } catch {}
    };
    this.ws.onclose = () => {
      setTimeout(() => this.connect(), Math.min(this.backoff, 15000));
      this.backoff *= 2;
    };
    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  subscribe(userIds: number[]) {
    this.send({ type: 'presence:subscribe', payload: { userIds } });
  }

  typingStart(chatId: number) {
    this.send({ type: 'typing:start', payload: { chatId } });
  }
  typingStop(chatId: number) {
    this.send({ type: 'typing:stop', payload: { chatId } });
  }

  onPresenceUpdate(cb: (u: PresenceUpdate) => void) { this.presenceHandlers.push(cb); }
  onTyping(cb: (t: TypingEvent) => void) { this.typingHandlers.push(cb); }

  private send(obj: any) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }
}
