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
  // 핸들 방향 벡터 (없으면 source→target 방향으로 fallback)
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

  // cp1: source에서 핸들 방향으로 뻗음
  let cp1x = sourceX + srcDir[0] * len
  let cp1y = sourceY + srcDir[1] * len
  // cp2: target에 핸들 방향으로 진입 (P3-P2 = tgtDir 방향)
  let cp2x = targetX + tgtDir[0] * len
  let cp2y = targetY + tgtDir[1] * len

  // 양방향 엣지 오프셋 — 겹치지 않게 수직 방향으로 밀기
  const bidirOffset: number = data?.bidirOffset ?? 0
  if (bidirOffset !== 0 && dist > 1) {
    const ex = targetX - sourceX, ey = targetY - sourceY
    const elen = Math.hypot(ex, ey)
    const perpX = (-ey / elen) * 28 * bidirOffset
    const perpY = ( ex / elen) * 28 * bidirOffset
    cp1x += perpX; cp1y += perpY
    cp2x += perpX; cp2y += perpY
  }

  const path = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${targetX} ${targetY}`
  const [labelX, labelY] = bezierMid(sourceX, sourceY, cp1x, cp1y, cp2x, cp2y, targetX, targetY)

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
