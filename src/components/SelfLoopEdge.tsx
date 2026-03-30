'use client'

import { EdgeProps, EdgeLabelRenderer } from 'reactflow'
import { ShapeLabel } from './ShapeIcon'

const STROKE = '#C8C2BC'

export default function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  label,
}: EdgeProps) {
  const rx = 44
  const ry = 54

  const d = [
    `M ${sourceX} ${sourceY}`,
    `C ${sourceX - rx} ${sourceY - ry * 2}`,
    `  ${sourceX + rx} ${sourceY - ry * 2}`,
    `  ${sourceX} ${sourceY}`,
  ].join(' ')

  // 끝점 접선 방향: cp2→endpoint = (-rx, 2ry)
  const angle = Math.atan2(2 * ry, -rx)
  const arrowLen = 7
  const arrowHalf = 3.5

  const baseCX = sourceX - arrowLen * Math.cos(angle)
  const baseCY = sourceY - arrowLen * Math.sin(angle)
  const p1x = baseCX + arrowHalf * Math.cos(angle + Math.PI / 2)
  const p1y = baseCY + arrowHalf * Math.sin(angle + Math.PI / 2)
  const p2x = baseCX + arrowHalf * Math.cos(angle - Math.PI / 2)
  const p2y = baseCY + arrowHalf * Math.sin(angle - Math.PI / 2)

  const labelStr = typeof label === 'string' ? label : ''
  const labelX = sourceX
  // 루프 정점(sourceY - ry*2) 바깥 위쪽에 표시
  const labelY = sourceY - ry * 2 - 16

  return (
    <>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.5}
      />

      {/* 출발점 도트 */}
      <circle cx={sourceX} cy={sourceY} r={2.5} fill={STROKE} />

      {/* 화살촉 */}
      <polygon
        points={`${sourceX},${sourceY} ${p1x},${p1y} ${p2x},${p2y}`}
        fill={STROKE}
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
