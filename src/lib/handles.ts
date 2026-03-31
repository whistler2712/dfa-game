import { Position } from 'reactflow'

export const NODE_SIZE = 44
const H = NODE_SIZE
const H2 = H / 2
const D = Math.round(H2 * Math.SQRT1_2 * 100) / 100   // ≈ 15.56

export interface HandleDef {
  id: string
  dx: number
  dy: number
  dir: [number, number]
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
 * excludeSourceHandle: 이미 반대 방향 엣지가 사용 중인 source 핸들 → 제외해서 다른 쌍 선택
 * excludeTargetHandle: 이미 반대 방향 엣지가 사용 중인 target 핸들 → 제외
 */
export function getBestHandlePair(
  srcX: number, srcY: number,
  tgtX: number, tgtY: number,
  excludeSourceHandle?: string,
  excludeTargetHandle?: string,
): { sourceHandle: string; targetHandle: string } {
  let best = { sourceHandle: 'h-e', targetHandle: 'h-w' }
  let bestDist = Infinity

  for (const sh of HANDLES) {
    if (sh.id === excludeSourceHandle) continue
    const sp = { x: srcX + sh.dx, y: srcY + sh.dy }
    for (const th of HANDLES) {
      if (th.id === excludeTargetHandle) continue
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