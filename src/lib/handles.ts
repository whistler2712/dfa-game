import { Position } from 'reactflow'

export const NODE_SIZE = 44
const H = NODE_SIZE
const H2 = H / 2
// 원 위 대각선 오프셋: R * cos(45°) = 22 * 0.7071 ≈ 15.56
const D = Math.round(H2 * Math.SQRT1_2 * 100) / 100   // ≈ 15.56

export interface HandleDef {
  id: string
  // 노드 top-left 기준 상대 좌표 (px) — 원 위의 점
  dx: number
  dy: number
  // 베지어 제어점용 단위 방향 벡터
  dir: [number, number]
  // 드래그 시작 방향 (ReactFlow Position prop)
  rfPosition: Position
}

export const HANDLES: HandleDef[] = [
  { id: 'h-n',  dx: H2,    dy: 0,      dir: [0, -1],               rfPosition: Position.Top    },
  { id: 'h-ne', dx: H2+D,  dy: H2-D,   dir: [0.707, -0.707],       rfPosition: Position.Right  },
  { id: 'h-e',  dx: H,     dy: H2,     dir: [1, 0],                rfPosition: Position.Right  },
  { id: 'h-se', dx: H2+D,  dy: H2+D,   dir: [0.707,  0.707],       rfPosition: Position.Right  },
  { id: 'h-s',  dx: H2,    dy: H,      dir: [0, 1],                rfPosition: Position.Bottom },
  { id: 'h-sw', dx: H2-D,  dy: H2+D,   dir: [-0.707,  0.707],      rfPosition: Position.Left   },
  { id: 'h-w',  dx: 0,     dy: H2,     dir: [-1, 0],               rfPosition: Position.Left   },
  { id: 'h-nw', dx: H2-D,  dy: H2-D,   dir: [-0.707, -0.707],      rfPosition: Position.Left   },
]

export const HANDLE_MAP: Record<string, HandleDef> = Object.fromEntries(
  HANDLES.map(h => [h.id, h])
)

// 핸들 ID → 노드 내 CSS 스타일
// top/left 를 %로 지정, transform은 항상 translate(-50%,-50%) 로 통일.
// → 핸들의 중심(center)이 해당 좌표에 정확히 위치함.
// 대각선 = 50% ± 35.36%  (R * cos45° / R * 100% = 35.36%)
export const HANDLE_STYLE: Record<string, React.CSSProperties> = {
  'h-n':  { top: '0%',     left: '50%',    transform: 'translate(-50%, -50%)' },
  'h-ne': { top: '14.64%', left: '85.36%', transform: 'translate(-50%, -50%)' },
  'h-e':  { top: '50%',    left: '100%',   transform: 'translate(-50%, -50%)' },
  'h-se': { top: '85.36%', left: '85.36%', transform: 'translate(-50%, -50%)' },
  'h-s':  { top: '100%',   left: '50%',    transform: 'translate(-50%, -50%)' },
  'h-sw': { top: '85.36%', left: '14.64%', transform: 'translate(-50%, -50%)' },
  'h-w':  { top: '50%',    left: '0%',     transform: 'translate(-50%, -50%)' },
  'h-nw': { top: '14.64%', left: '14.64%', transform: 'translate(-50%, -50%)' },
}

/** 노드 position 기준 핸들의 절대 좌표 반환 */
export function getHandleAbsPos(
  nodeX: number,
  nodeY: number,
  handleId: string
): { x: number; y: number } {
  const h = HANDLE_MAP[handleId]
  if (!h) return { x: nodeX + H2, y: nodeY + H2 }
  return { x: nodeX + h.dx, y: nodeY + h.dy }
}

/**
 * 두 노드 사이에서 거리가 가장 짧은 핸들 쌍을 반환.
 * srcExclude: source 노드에서 제외할 핸들 ID (bidir 시 기존 엣지 핸들)
 */
export function getBestHandlePair(
  srcX: number, srcY: number,
  tgtX: number, tgtY: number,
): { sourceHandle: string; targetHandle: string } {
  let best = { sourceHandle: 'h-e', targetHandle: 'h-w' }
  let bestDist = Infinity

  for (const sh of HANDLES) {
    const sp = { x: srcX + sh.dx, y: srcY + sh.dy }
    for (const th of HANDLES) {
      const tp = { x: tgtX + th.dx, y: tgtY + th.dy }
      const d = Math.hypot(sp.x - tp.x, sp.y - tp.y)
      if (d < bestDist) {
        bestDist = d
        best = { sourceHandle: sh.id, targetHandle: th.id }
      }
    }
  }

  return best
}

/**
 * source 핸들 위치 기준으로 target 노드에서 가장 가까운 핸들 ID 반환.
 */
export function getBestTargetHandle(
  srcHandleX: number,
  srcHandleY: number,
  tgtNodeX: number,
  tgtNodeY: number,
): string {
  let best = 'h-w'
  let bestDist = Infinity
  for (const h of HANDLES) {
    const d = Math.hypot(
      (tgtNodeX + h.dx) - srcHandleX,
      (tgtNodeY + h.dy) - srcHandleY,
    )
    if (d < bestDist) { bestDist = d; best = h.id }
  }
  return best
}
