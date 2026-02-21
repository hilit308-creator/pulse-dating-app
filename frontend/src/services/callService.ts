// frontend/src/services/callService.ts

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WS_URL = API_URL.replace(/^http/, 'ws');

type Invite = { chatId: number; kind: 'audio'|'video'; sdpOffer: any };

type Ringing = { callId: string };

type Accept = { callId: string; sdpAnswer: any };

type Candidate = { callId: string; candidate: any };

type End = { callId: string; reason?: string };

export class CallService {
  private ws?: WebSocket;
  private url: string;
  private token: string;
  private backoff = 1000;
  private ringingHandlers: Array<(r: Ringing) => void> = [];
  private endHandlers: Array<(e: End) => void> = [];
  private errorHandlers: Array<(e: { callId?: string; code?: string; message?: string }) => void> = [];

  constructor(url = `${WS_URL}/call`, token = '') {
    this.url = url;
    this.token = token;
  }

  connect() {
    const sep = this.url.includes('?') ? '&' : '?';
    const wsUrl = this.token ? `${this.url}${sep}token=${encodeURIComponent(this.token)}` : this.url;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => { this.backoff = 1000; };
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        switch (msg?.type) {
          case 'call:ringing': this.ringingHandlers.forEach(h => h(msg.payload as Ringing)); break;
          case 'call:end': this.endHandlers.forEach(h => h(msg.payload as End)); break;
          case 'call:error': this.errorHandlers.forEach(h => h(msg.payload || {})); break;
        }
      } catch {}
    };
    this.ws.onclose = () => { setTimeout(() => this.connect(), Math.min(this.backoff, 15000)); this.backoff *= 2; };
    this.ws.onerror = () => { this.ws?.close(); };
  }

  startInvite(payload: Invite) { this.send({ type: 'call:invite', payload }); }
  accept(payload: Accept) { this.send({ type: 'call:accept', payload }); }
  sendCandidate(payload: Candidate) { this.send({ type: 'call:candidate', payload }); }
  end(payload: End) { this.send({ type: 'call:end', payload }); }

  onRinging(cb: (r: Ringing) => void) { this.ringingHandlers.push(cb); }
  onEnd(cb: (e: End) => void) { this.endHandlers.push(cb); }
  onError(cb: (e: { callId?: string; code?: string; message?: string }) => void) { this.errorHandlers.push(cb); }

  private send(obj: any) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj)); }
}

export async function createPeer(kind: 'audio'|'video') {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
  const stream = await navigator.mediaDevices.getUserMedia(kind === 'video' ? { video: true, audio: true } : { audio: true });
  stream.getTracks().forEach(t => pc.addTrack(t, stream));
  return { pc, localStream: stream } as const;
}
