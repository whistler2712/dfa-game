import type { Shape } from './levels'

const STORAGE_KEY = 'dfa-sound-enabled'

// 도형별 음높이 매핑
const SHAPE_FREQ: Record<Shape, number> = {
  '★': 523,  // 도
  '●': 659,  // 미
  '■': 784,  // 솔
}

class SoundManager {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // localStorage에서 설정 읽기 (클라이언트 사이드에서만)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        this.enabled = stored === null ? true : stored === 'true'
      } catch {
        this.enabled = true
      }
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    startTime?: number,
    gainValue: number = 0.28
  ): void {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const t = startTime ?? ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = type
      osc.frequency.setValueAtTime(frequency, t)
      gain.gain.setValueAtTime(gainValue, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

      osc.start(t)
      osc.stop(t + duration + 0.01)
    } catch {
      // AudioContext 실패 시 무시
    }
  }

  private playSlide(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    startTime?: number,
    gainValue: number = 0.25
  ): void {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const t = startTime ?? ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = type
      osc.frequency.setValueAtTime(freqStart, t)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration)
      gain.gain.setValueAtTime(gainValue, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

      osc.start(t)
      osc.stop(t + duration + 0.01)
    } catch {
      // ignore
    }
  }

  /** 통로 연결음 — 도형마다 다른 음높이의 짧은 틱 */
  playConnect(shape: Shape): void {
    const freq = SHAPE_FREQ[shape] ?? 523
    this.playTone(freq, 0.08, 'triangle', undefined, 0.22)
  }

  /** 방 추가음 — 300Hz → 500Hz 슬라이드 */
  playAddNode(): void {
    this.playSlide(300, 500, 0.1, 'sine', undefined, 0.22)
  }

  /** 정답 확인 통과음 — 도→미→솔 빠른 상승 3음 */
  playCorrect(): void {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const t = ctx.currentTime
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        this.playTone(freq, 0.08, 'sine', t + i * 0.09, 0.25)
      })
    } catch {
      // ignore
    }
  }

  /** 정답 확인 오답음 — 300Hz → 200Hz 하강 */
  playWrong(): void {
    this.playSlide(300, 200, 0.15, 'sawtooth', undefined, 0.2)
  }

  /** 레벨 클리어 팡파레 — 도→미→솔→도(high) */
  playClear(): void {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const t = ctx.currentTime
      const notes = [
        { freq: 523,  dur: 0.12 },
        { freq: 659,  dur: 0.12 },
        { freq: 784,  dur: 0.12 },
        { freq: 1047, dur: 0.30 },
      ]
      let offset = 0
      notes.forEach(({ freq, dur }) => {
        this.playTone(freq, dur, 'sine', t + offset, 0.28)
        offset += dur + 0.02
      })
    } catch {
      // ignore
    }
  }

  /** 별점 등장음 — 800Hz → 1200Hz 반짝이는 짧은 슬라이드 */
  playStar(delayMs: number = 0): void {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const t = ctx.currentTime + delayMs / 1000
      this.playSlide(800, 1200, 0.06, 'sine', t, 0.18)
    } catch {
      // ignore
    }
  }

  /** 되돌리기 음 — 낮은 틱 */
  playUndo(): void {
    this.playTone(200, 0.06, 'sine', undefined, 0.18)
  }

  toggle(): void {
    this.enabled = !this.enabled
    try {
      localStorage.setItem(STORAGE_KEY, String(this.enabled))
    } catch {
      // ignore
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }
}

export const soundManager = new SoundManager()
