'use client'

import { useTutorial, TutorialStep } from '@/hooks/useTutorial'

// ── 단계별 표시 이름 ─────────────────────────────────────────────
const STEP_TITLE: Record<TutorialStep, string> = {
  'intro':           '게임 소개',
  'mission':         '예시 읽는 법',
  'add-node':        '방 추가하기',
  'set-states':      '방 역할 지정',
  'add-edge':        '통로 연결하기',
  'how-it-works':    '미로 작동 원리',
  'self-loop':       '제자리 통로',
  'check-solution':  '정답 확인',
}

// ── 단계별 대기 안내 ─────────────────────────────────────────────
const WAIT_HINT: Partial<Record<TutorialStep, string>> = {
  'add-node':   '캔버스를 더블클릭해서 방을 하나 추가해보세요.',
  'set-states': '방을 우클릭해서 정답 방으로 지정해보세요.',
  'add-edge':   '방에서 방으로 드래그해서 통로를 연결해보세요.',
  'self-loop':  '방에서 드래그를 시작해 같은 방 위에서 놓아보세요.',
}

// ── CSS keyframe 애니메이션 ──────────────────────────────────────
const KEYFRAMES = `
@keyframes tut-pop {
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes tut-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
@keyframes tut-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(255,126,107,0.5); }
  70%  { box-shadow: 0 0 0 10px rgba(255,126,107,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,126,107,0); }
}
@keyframes tut-blink-cursor {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes tut-node-appear {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}
@keyframes tut-spotlight-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes tut-token-move {
  0%   { left: 20px;  opacity: 1; }
  40%  { left: 88px;  opacity: 1; }
  55%  { left: 88px;  opacity: 1; }
  95%  { left: 156px; opacity: 1; }
  100% { left: 156px; opacity: 1; }
}
@keyframes tut-shape-consume {
  0%   { opacity: 1; transform: scale(1); }
  30%  { opacity: 1; transform: scale(1.2); }
  60%  { opacity: 0; transform: scale(0.5) translateY(-8px); }
  100% { opacity: 0; }
}
@keyframes tut-shape2-consume {
  0%,  50% { opacity: 1; transform: scale(1); }
  80%       { opacity: 1; transform: scale(1.2); }
  100%      { opacity: 0; transform: scale(0.5) translateY(-8px); }
}
`

// ── 도형 SVG 아이콘 ──────────────────────────────────────────────
function Star({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="#F5A623"
      />
    </svg>
  )
}
function Circle({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#5B9BD5" />
    </svg>
  )
}
function Square({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#5BB87A" />
    </svg>
  )
}

// ── 스포트라이트 레이아웃 ────────────────────────────────────────
const HUD_H = 48
const PANEL_W = 288
const DIM = 'rgba(0,0,0,0.52)'

type HLRegion = { top: string; left: string; width: string; height: string }

const CANVAS_HL: HLRegion = {
  top:    `${HUD_H}px`,
  left:   `${PANEL_W}px`,
  width:  `calc(100vw - ${PANEL_W}px)`,
  height: `calc(100vh - ${HUD_H}px)`,
}
const PANEL_HL: HLRegion = {
  top:    `${HUD_H}px`,
  left:   '0px',
  width:  `${PANEL_W}px`,
  height: `calc(100vh - ${HUD_H}px)`,
}

const CANVAS_SIDE_CONTAINER: React.CSSProperties = {
  position: 'fixed',
  top:   `${HUD_H}px`,
  left:  0,
  width: `${PANEL_W}px`,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 201,
}
const PANEL_SIDE_CONTAINER: React.CSSProperties = {
  position: 'fixed',
  top:   `${HUD_H}px`,
  left:  `${PANEL_W}px`,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 201,
}
const CENTER_CONTAINER: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 201,
}

const STEP_LAYOUT: Record<TutorialStep, { hl?: HLRegion; container: React.CSSProperties }> = {
  'intro':           { container: CENTER_CONTAINER },
  'mission':         { hl: PANEL_HL,  container: PANEL_SIDE_CONTAINER },
  'add-node':        { hl: CANVAS_HL, container: CANVAS_SIDE_CONTAINER },
  'set-states':      { hl: CANVAS_HL, container: CANVAS_SIDE_CONTAINER },
  'add-edge':        { hl: CANVAS_HL, container: CANVAS_SIDE_CONTAINER },
  'how-it-works':    { container: CENTER_CONTAINER },
  'self-loop':       { hl: CANVAS_HL, container: CANVAS_SIDE_CONTAINER },
  'check-solution':  { hl: PANEL_HL,  container: PANEL_SIDE_CONTAINER },
}

// ── 스포트라이트 오버레이 ────────────────────────────────────────
function SpotlightOverlay({ hl }: { hl?: HLRegion }) {
  const stripBase: React.CSSProperties = {
    position: 'fixed',
    background: DIM,
    zIndex: 200,
    pointerEvents: 'auto',
    animation: 'tut-spotlight-in 0.25s ease',
  }
  if (!hl) return <div style={{ ...stripBase, inset: 0 }} />
  const { top, left, width, height } = hl
  return (
    <>
      <div style={{ ...stripBase, top: 0, left: 0, right: 0, height: top }} />
      <div style={{ ...stripBase, top: `calc(${top} + ${height})`, left: 0, right: 0, bottom: 0 }} />
      <div style={{ ...stripBase, top, left: 0, width: left, height }} />
      <div style={{ ...stripBase, top, left: `calc(${left} + ${width})`, right: 0, height }} />
      <div style={{
        position: 'fixed', top, left, width, height,
        border: '2px solid rgba(255,255,255,0.18)',
        borderRadius: 8, zIndex: 200, pointerEvents: 'none',
        animation: 'tut-spotlight-in 0.3s ease',
      }} />
    </>
  )
}

// ── 단계별 말풍선 내용 ───────────────────────────────────────────
function StepContent({ step }: { step: TutorialStep }) {
  const body: React.CSSProperties = {
    fontFamily: 'Nunito, sans-serif',
    fontSize: 14,
    color: '#5a5047',
    textAlign: 'center',
    lineHeight: 1.7,
    margin: 0,
  }
  const sub: React.CSSProperties = {
    fontFamily: 'Nunito, sans-serif',
    fontSize: 12,
    color: '#B0ABA6',
    textAlign: 'center',
    lineHeight: 1.6,
    margin: 0,
  }

  // ── 1단계: 게임 소개 ─────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {[
            { el: <Star size={40} />,   delay: '0s',    floatDelay: '0s'   },
            { el: <Circle size={40} />, delay: '0.12s', floatDelay: '0.3s' },
            { el: <Square size={40} />, delay: '0.24s', floatDelay: '0.6s' },
          ].map(({ el, delay, floatDelay }, i) => (
            <div key={i} style={{
              animation: `tut-pop 0.4s ${delay} cubic-bezier(.34,1.56,.64,1) both,
                          tut-float 2.4s ${floatDelay} ease-in-out infinite`,
            }}>
              {el}
            </div>
          ))}
        </div>

        <p style={body}>
          도형이 하나씩 들어올 때<br />
          <strong>통과할지, 막을지</strong> 결정하는<br />
          방과 통로 미로를 만드는 퍼즐이에요.
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#F9F6F2', borderRadius: 10, padding: '8px 14px',
        }}>
          <Star size={14} /><Circle size={14} /><Square size={14} />
          <span style={{ ...sub, marginLeft: 4 }}>도형 순서의 패턴을 찾아 미로를 완성해요</span>
        </div>
      </div>
    )
  }

  // ── 2단계: 예시 읽는 법 ──────────────────────────────────────
  if (step === 'mission') {
    const chipBase: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 10,
      fontFamily: 'Nunito, sans-serif', fontSize: 13,
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        <p style={body}>
          왼쪽 패널에서 <strong>어떤 도형 순서가 통과인지</strong> 확인해요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ ...sub, textAlign: 'left', marginBottom: 2 }}>예시</p>
          <div style={{ ...chipBase, background: '#E8F7EE', border: '1px solid #BBE8CE' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2a7a4a', minWidth: 28 }}>통과</span>
            <Star size={14} /><Circle size={14} /><Square size={14} />
            <span style={{ marginLeft: 'auto', color: '#2a7a4a', fontWeight: 800 }}>✓</span>
          </div>
          <div style={{ ...chipBase, background: '#FEF0EE', border: '1px solid #F8C5BC' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', minWidth: 28 }}>막힘</span>
            <Circle size={14} /><Square size={14} />
            <span style={{ marginLeft: 'auto', color: '#c0392b', fontWeight: 800 }}>✗</span>
          </div>
        </div>

        <p style={sub}>
          초록 예시는 <strong style={{ color: '#2a7a4a' }}>반드시 통과</strong>시키고,<br />
          빨간 예시는 <strong style={{ color: '#c0392b' }}>반드시 막아야</strong> 해요.
        </p>
      </div>
    )
  }

  // ── 3단계: 방 추가하기 ───────────────────────────────────────
  if (step === 'add-node') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={body}>
          캔버스를 <strong>더블클릭</strong>하면<br />새로운 방이 생겨요!
        </p>

        <div style={{ position: 'relative', width: 140, height: 90 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FDF6EC', borderRadius: 12, border: '1.5px dashed #D4CFC9',
          }} />
          <div style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            width: 34, height: 34, borderRadius: '50%',
            background: '#DAEAF8', border: '2px solid #5B9BD5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#2a6ba8',
          }}>방 1</div>
          <div style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            width: 34, height: 34, borderRadius: '50%',
            background: 'white', border: '1.5px solid #D4CFC9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#5a5047',
            animation: 'tut-node-appear 0.5s 0.4s cubic-bezier(.34,1.56,.64,1) both, tut-pulse-ring 1.6s 0.9s ease-out infinite',
          }}>방 2</div>
          <div style={{
            position: 'absolute', right: 26, top: 18,
            fontSize: 18, lineHeight: 1,
            animation: 'tut-blink-cursor 0.9s 0s step-end 2',
            userSelect: 'none',
          }}>🖱️</div>
        </div>

        <p style={sub}>방을 추가하면 자동으로 다음 단계로 넘어가요.</p>
      </div>
    )
  }

  // ── 4단계: 방 역할 지정 ─────────────────────────────────────
  if (step === 'set-states') {
    const nodeBase: React.CSSProperties = {
      width: 38, height: 38, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700,
      flexShrink: 0, boxSizing: 'border-box',
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={body}>
          방을 <strong>우클릭</strong>하면<br />정답 방으로 지정할 수 있어요!
        </p>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #5BB87A' }} />
              <div style={{
                ...nodeBase, width: 38, height: 38,
                background: '#D9F2E3', border: '2px solid #5BB87A', color: '#2a7a4a',
                animation: 'tut-pulse-ring 1.8s 0.3s ease-out infinite',
              }}>방 2</div>
            </div>
            <span style={{ ...sub, fontSize: 11, color: '#2a7a4a', fontWeight: 700 }}>정답 방</span>
            <span style={{ ...sub, fontSize: 10 }}>여기서 끝나면 통과</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...nodeBase, background: '#DAEAF8', border: '2px solid #5B9BD5', color: '#2a6ba8' }}>
                방 1
              </div>
            </div>
            <span style={{ ...sub, fontSize: 11, color: '#2a6ba8', fontWeight: 700 }}>시작 방</span>
            <span style={{ ...sub, fontSize: 10 }}>항상 여기서 출발</span>
          </div>
        </div>

        <div style={{ background: '#F9F6F2', borderRadius: 10, padding: '8px 14px', width: '100%', boxSizing: 'border-box' }}>
          <p style={{ ...sub, fontSize: 11 }}>
            🔵 첫 번째 방은 자동으로 <strong style={{ color: '#2a6ba8' }}>시작 방</strong>이 돼요.<br />
            🟢 우클릭한 방은 <strong style={{ color: '#2a7a4a' }}>정답 방 (이중 원)</strong>이 돼요.
          </p>
        </div>
      </div>
    )
  }

  // ── 5단계: 통로 연결하기 ─────────────────────────────────────
  if (step === 'add-edge') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={body}>
          방에서 방으로 <strong>드래그</strong>하면<br />통로가 연결돼요!
        </p>

        <div style={{ position: 'relative', width: 200, height: 80 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FDF6EC', borderRadius: 12, border: '1.5px dashed #D4CFC9',
          }} />
          <div style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: '#DAEAF8', border: '2px solid #5B9BD5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#2a6ba8',
          }}>방 1</div>
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
            <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '2px solid #5BB87A' }} />
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#D9F2E3', border: '2px solid #5BB87A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#2a7a4a',
              position: 'relative',
            }}>방 2</div>
          </div>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 200 80">
            <defs>
              <marker id="tut-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#C8C2BC" />
              </marker>
              <style>{`
                @keyframes tut-draw-edge {
                  from { stroke-dashoffset: 120; opacity: 0.3; }
                  to   { stroke-dashoffset: 0;   opacity: 1; }
                }
                .tut-edge { stroke-dasharray: 120; stroke-dashoffset: 120; animation: tut-draw-edge 0.7s 0.2s ease-out forwards; }
              `}</style>
            </defs>
            <path className="tut-edge" d="M 52 40 C 80 20, 120 20, 148 40" fill="none" stroke="#C8C2BC" strokeWidth="1.5" markerEnd="url(#tut-arrow)" />
          </svg>
          <div style={{
            position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)',
            background: '#FDF6EC', border: '1px solid #E8DFD4', borderRadius: 6, padding: '2px 6px',
            display: 'flex', gap: 3, alignItems: 'center',
            animation: 'tut-pop 0.3s 0.8s cubic-bezier(.34,1.56,.64,1) both',
          }}>
            <Star size={12} />
          </div>
        </div>

        <p style={sub}>
          통로를 연결하면 <strong>어떤 도형일 때 이동할지</strong><br />선택하는 창이 떠요.
        </p>
      </div>
    )
  }

  // ── 6단계: 미로 작동 원리 (NEW) ──────────────────────────────
  if (step === 'how-it-works') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <p style={body}>
          도형은 <strong>한 번에 하나씩</strong> 읽혀요.<br />
          읽을 때마다 해당 통로를 따라 <strong>방이 이동</strong>해요.
        </p>

        {/* 애니메이션: 방 2개 + 통로 + 토큰 이동 */}
        <div style={{ position: 'relative', width: 220, height: 100 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FDF6EC', borderRadius: 14, border: '1.5px dashed #D4CFC9',
          }} />

          {/* 방 1 */}
          <div style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: '50%',
            background: '#DAEAF8', border: '2px solid #5B9BD5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#2a6ba8',
          }}>방 1</div>

          {/* 방 2 (정답 방) */}
          <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}>
            <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '2px solid #5BB87A' }} />
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#D9F2E3', border: '2px solid #5BB87A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#2a7a4a',
              position: 'relative',
            }}>방 2</div>
          </div>

          {/* 통로 화살표 */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 220 100">
            <defs>
              <marker id="hw-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#C8C2BC" />
              </marker>
            </defs>
            <line x1="60" y1="50" x2="155" y2="50" stroke="#C8C2BC" strokeWidth="1.5" markerEnd="url(#hw-arrow)" />
          </svg>

          {/* 통로 라벨: ★ */}
          <div style={{
            position: 'absolute', left: '50%', top: 16, transform: 'translateX(-50%)',
            background: '#FDF6EC', border: '1px solid #E8DFD4', borderRadius: 6, padding: '1px 5px',
            display: 'flex', alignItems: 'center',
          }}>
            <Star size={12} />
          </div>

          {/* 토큰 (현재 위치 표시) — 방 1에서 방 2로 이동 */}
          <div style={{
            position: 'absolute',
            top: 'calc(50% - 9px)',
            width: 18, height: 18,
            borderRadius: '50%',
            background: '#FF7E6B',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(255,126,107,0.5)',
            animation: 'tut-token-move 2.4s 0.5s ease-in-out infinite',
          }} />
        </div>

        {/* 도형 소모 시각화 */}
        <div style={{
          background: '#F9F6F2', borderRadius: 12, padding: '12px 16px',
          width: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ ...sub, fontSize: 11, textAlign: 'left', fontWeight: 700, color: '#8a7f76' }}>
            예: ★ → ● 순서가 들어오면
          </p>

          {/* 도형 큐 시각화 */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* ★ 소모됨 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ animation: 'tut-shape-consume 2.4s 0.5s ease-in-out infinite' }}>
                <Star size={20} />
              </div>
              <span style={{ fontSize: 9, color: '#FF7E6B', fontFamily: 'Nunito', fontWeight: 700 }}>1번째</span>
            </div>

            <span style={{ color: '#D4CFC9', fontSize: 14 }}>→</span>

            {/* ● 소모됨 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ animation: 'tut-shape2-consume 2.4s 0.5s ease-in-out infinite' }}>
                <Circle size={20} />
              </div>
              <span style={{ fontSize: 9, color: '#5B9BD5', fontFamily: 'Nunito', fontWeight: 700 }}>2번째</span>
            </div>

            <span style={{ color: '#D4CFC9', fontSize: 14 }}>→</span>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 20, height: 20,
                border: '1.5px dashed #D4CFC9', borderRadius: '50%',
              }} />
              <span style={{ fontSize: 9, color: '#D4CFC9', fontFamily: 'Nunito' }}>끝</span>
            </div>
          </div>

          <p style={{ ...sub, fontSize: 11 }}>
            ★을 읽으면 ★ 통로로 이동,<br />
            ●을 읽으면 ● 통로로 이동해요.<br />
            <strong style={{ color: '#5a5047' }}>모든 도형을 읽은 뒤 정답 방에 있으면 통과!</strong>
          </p>
        </div>
      </div>
    )
  }

  // ── 7단계: 제자리 통로 ───────────────────────────────────────
  if (step === 'self-loop') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={body}>
          같은 방에 머무는<br />
          <strong>제자리 통로</strong>도 만들 수 있어요!
        </p>

        <div style={{ position: 'relative', width: 180, height: 130 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FDF6EC', borderRadius: 12, border: '1.5px dashed #D4CFC9',
          }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 180 130">
            <defs>
              <marker id="tut-sl-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#C8C2BC" />
              </marker>
              <style>{`
                @keyframes tut-draw-loop {
                  from { stroke-dashoffset: 180; opacity: 0.2; }
                  to   { stroke-dashoffset: 0;   opacity: 1; }
                }
                .tut-loop { stroke-dasharray: 180; stroke-dashoffset: 180; animation: tut-draw-loop 0.9s 0.3s ease-out forwards; }
                @keyframes tut-loop-label {
                  from { opacity: 0; transform: scale(0.5); }
                  to   { opacity: 1; transform: scale(1); }
                }
                .tut-loop-label { animation: tut-loop-label 0.4s 1.1s cubic-bezier(.34,1.56,.64,1) both; }
              `}</style>
            </defs>
            <circle cx="90" cy="88" r="28" fill="#DAEAF8" stroke="#5B9BD5" strokeWidth="2" />
            <text x="90" y="93" textAnchor="middle" fontSize="10"
              fontFamily="Nunito, sans-serif" fontWeight="700" fill="#2a6ba8">방 1</text>
            <path className="tut-loop" d="M 72 63 Q 50 15 108 63" fill="none" stroke="#C8C2BC" strokeWidth="1.8" markerEnd="url(#tut-sl-arrow)" />
            <g className="tut-loop-label" transform="translate(90, 28)">
              <rect x="-14" y="-10" width="28" height="20" rx="5" fill="#FDF6EC" stroke="#E8DFD4" strokeWidth="1" />
              <polygon points="0,-7 1.7,-2 6.6,-2 2.9,1 4.1,6 0,3.2 -4.1,6 -2.9,1 -6.6,-2 -1.7,-2" fill="#F5A623" transform="scale(0.9)" />
            </g>
          </svg>
        </div>

        <p style={sub}>
          방에서 드래그를 시작해<br />
          <strong>같은 방 위에서 놓으면</strong> 제자리 통로가 만들어져요.
        </p>

        <div style={{ background: '#F9F6F2', borderRadius: 10, padding: '8px 14px', width: '100%', boxSizing: 'border-box' }}>
          <p style={{ ...sub, fontSize: 11 }}>
            💡 ★ 제자리 통로 → ★을 읽어도 <strong style={{ color: '#5a5047' }}>방을 이동하지 않고</strong> 그 자리에 머물러요.
          </p>
        </div>
      </div>
    )
  }

  // ── 8단계: 정답 확인 ─────────────────────────────────────────
  if (step === 'check-solution') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <p style={body}>
          미로가 완성되면<br />
          <strong>정답 확인</strong> 버튼을 눌러봐요!
        </p>

        <div style={{
          padding: '12px 32px', borderRadius: 14,
          background: '#FF7E6B', color: 'white',
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 15,
          boxShadow: '0 4px 20px rgba(255,126,107,0.4)',
          animation: 'tut-pulse-ring 1.4s ease-out infinite',
          userSelect: 'none',
        }}>
          정답 확인
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {[
            { pass: true,  icons: [<Star key="s" size={12} />], label: '통과' },
            { pass: false, icons: [<Circle key="c" size={12} />, <Square key="sq" size={12} />], label: '막힘' },
          ].map(({ pass, icons, label }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 8,
              background: pass ? '#E8F7EE' : '#FEF0EE',
              border: `1px solid ${pass ? '#BBE8CE' : '#F8C5BC'}`,
              animation: `tut-pop 0.3s ${0.1 + i * 0.15}s cubic-bezier(.34,1.56,.64,1) both`,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: pass ? '#2a7a4a' : '#c0392b', minWidth: 24 }}>{label}</span>
              {icons}
              <span style={{ marginLeft: 'auto', fontWeight: 800, color: pass ? '#2a7a4a' : '#c0392b' }}>
                {pass ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>

        <p style={{ ...sub, fontSize: 11, textAlign: 'center' }}>
          모든 예시를 통과하면 🌟 클리어!<br />
          실패해도 괜찮아요 — 다시 도전하면 돼요.
        </p>
      </div>
    )
  }

  return <div style={{ minHeight: 80 }} />
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export default function TutorialOverlay() {
  const {
    isActive, stepIndex, currentStep, totalSteps,
    conditionMet, advance, skip, complete,
  } = useTutorial()

  if (!isActive) return null

  const isLastStep = stepIndex === totalSteps - 1
  const waitHint   = !conditionMet ? WAIT_HINT[currentStep] : undefined
  const layout     = STEP_LAYOUT[currentStep]

  return (
    <>
      <style>{KEYFRAMES}</style>
      <SpotlightOverlay hl={layout.hl} />

      <div style={layout.container}>
        <div style={{
          pointerEvents: 'auto',
          background: 'white',
          borderRadius: 20,
          padding: '24px 24px 20px',
          maxWidth: 340,
          width: 'calc(100% - 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
        }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700,
              color: '#B0ABA6', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {stepIndex + 1} / {totalSteps}
            </span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#FF7E6B' }}>
              {STEP_TITLE[currentStep]}
            </span>
          </div>

          <StepContent step={currentStep} />

          {/* 대기 안내 */}
          {waitHint && (
            <div style={{
              background: '#FFF8E8', border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: 10, padding: '9px 14px',
              fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#c47d00', textAlign: 'center',
            }}>
              {waitHint}
            </div>
          )}

          {/* 진행 점 */}
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: i === stepIndex ? 20 : 6, height: 6, borderRadius: 3,
                background: i <= stepIndex ? '#FF7E6B' : '#E5E0DA',
                transition: 'width 0.2s ease, background 0.2s ease',
              }} />
            ))}
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={skip} style={{
              border: 'none', background: 'none',
              fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#B0ABA6',
              cursor: 'pointer', padding: '4px 2px',
              textDecoration: 'underline', textUnderlineOffset: 2,
            }}>
              건너뛰기
            </button>
            <button
              onClick={isLastStep ? complete : advance}
              disabled={!conditionMet}
              style={{
                padding: '10px 24px', borderRadius: 12, border: 'none',
                background: conditionMet ? '#FF7E6B' : '#E5E0DA',
                color: conditionMet ? 'white' : '#B0ABA6',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14,
                cursor: conditionMet ? 'pointer' : 'default',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              {isLastStep ? '완료 🎉' : '다음 →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}