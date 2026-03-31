'use client'

import { EdgeProps, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { ShapeLabel } from './ShapeIcon'
import { HANDLE_MAP } from '@/lib/handles'

const STROKE = '#C8C2BC'

/** 베지어 중점 (t=0.5) */
function bezierMid(
  sx: number, sy: number,
  cp1x: number, cp1y: number,
  cp2x: number, cp2y: number,
  tx: number, ty: number,
): [number, number] {
  return [
    0.125*sx + 0.375*cp1x + 0.375*cp2x + 0.125*tx,
    0.125*sy + 0.375*cp1y + 0.375*cp2y + 0.125*ty,
  ]
}

export default function DFAEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  label,
  data,
  markerEnd,
  sourceHandleId,
  targetHandleId,
}: EdgeProps) {
  const rawDir = (): [number, number] => {
    const dx = targetX - sourceX, dy = targetY - sourceY
    const len = Math.hypot(dx, dy) || 1
    return [dx / len, dy / len]
  }

  const srcDir: [number, number] =
    HANDLE_MAP[sourceHandleId ?? '']?.dir ?? rawDir()
  const tgtDir: [number, number] =
    HANDLE_MAP[targetHandleId ?? '']?.dir ?? ((): [number, number] => {
      const [dx, dy] = rawDir(); return [-dx, -dy]
    })()

  const dist = Math.hypot(targetX - sourceX, targetY - sourceY)
  const len = Math.min(dist * 0.4, 120)

  // 양방향 엣지 오프셋 — 시작점·끝점·컨트롤포인트 모두 수직 방향으로 밀어야 완전히 분리됨
  const bidirOffset: number = data?.bidirOffset ?? 0

  let sx = sourceX, sy = sourceY
  let tx = targetX, ty = targetY

  if (bidirOffset !== 0 && dist > 1) {
    const ex = targetX - sourceX, ey = targetY - sourceY
    const elen = Math.hypot(ex, ey)
    const perpX = (-ey / elen) * 12 * bidirOffset
    const perpY = ( ex / elen) * 12 * bidirOffset
    sx += perpX; sy += perpY
    tx += perpX; ty += perpY
  }

  const cp1x = sx + srcDir[0] * len
  const cp1y = sy + srcDir[1] * len
  const cp2x = tx + tgtDir[0] * len
  const cp2y = ty + tgtDir[1] * len

  const path = `M ${sx} ${sy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${tx} ${ty}`
  const [labelX, labelY] = bezierMid(sx, sy, cp1x, cp1y, cp2x, cp2y, tx, ty)

  const labelStr = typeof label === 'string' ? label : ''

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{ stroke: STROKE, strokeWidth: 1.5 }}
        markerEnd={markerEnd}
      />

      {labelStr && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: '#FDF6EC',
              borderRadius: 6,
              padding: '2px 5px',
              border: '1px solid #E8DFD4',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            <ShapeLabel label={labelStr} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}