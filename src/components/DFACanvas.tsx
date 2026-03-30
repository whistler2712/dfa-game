'use client'

import { useCallback, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  ConnectionMode,
  EdgeChange,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import DFAStateNode from './DFAStateNode'
import DFAEdge from './DFAEdge'
import SelfLoopEdge from './SelfLoopEdge'
import { ShapeIcon } from './ShapeIcon'
import { useGameStore } from '@/store/gameStore'
import { Shape } from '@/lib/levels'
import { getBestHandlePair } from '@/lib/handles'
import { soundManager } from '@/lib/sounds'

const nodeTypes = { dfaState: DFAStateNode }
const edgeTypes = { dfa: DFAEdge, selfLoop: SelfLoopEdge }

const SHAPES: Shape[] = ['★', '●', '■']
const NODE_HALF = 22

const MARKER = {
  type: MarkerType.ArrowClosed,
  color: '#C8C2BC',
  width: 10,
  height: 10,
}

type NodeData = { label: string; isInitial: boolean; isAccepting: boolean }

function DFACanvasInner() {
  const { nodes, edges, setNodes, setEdges, addNode, toggleAccepting, saveHistory } = useGameStore()
  const { screenToFlowPosition } = useReactFlow()

  const [pendingEdge, setPendingEdge] = useState<Connection | null>(null)
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null)
  const [edgeLabel, setEdgeLabel] = useState<Shape[]>([])

  // ── 노드 변경 ──────────────────────────────────────────────
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasRemove = changes.some(c => c.type === 'remove')
      if (hasRemove) saveHistory()
      setNodes(applyNodeChanges(changes, nodes) as Node<NodeData>[])
    },
    [nodes, setNodes, saveHistory]
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const hasRemove = changes.some(c => c.type === 'remove')
      if (hasRemove) saveHistory()
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges, saveHistory]
  )

  // ── 드래그 끝: 연결된 엣지 핸들 쌍 재계산 ─────────────────
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: Node, allNodes: Node[]) => {
      const nodeMap = new Map(allNodes.map(n => [n.id, n]))
      const currentEdges = useGameStore.getState().edges

      const nextEdges = currentEdges.map(e => {
        if (e.source === e.target) return e                        // self-loop
        if (e.source !== draggedNode.id && e.target !== draggedNode.id) return e

        const srcNode = nodeMap.get(e.source)
        const tgtNode = nodeMap.get(e.target)
        if (!srcNode || !tgtNode) return e

        const { sourceHandle, targetHandle } = getBestHandlePair(
          srcNode.position.x, srcNode.position.y,
          tgtNode.position.x, tgtNode.position.y,
        )
        return { ...e, sourceHandle, targetHandle }
      })

      setEdges(nextEdges)
    },
    [setEdges]
  )

  // ── 새 연결 ──────────────────────────────────────────────
  const onConnect = useCallback((connection: Connection) => {
    const isSelfLoop = connection.source === connection.target
    let sh = connection.sourceHandle ?? 'h-e'
    let th = connection.targetHandle ?? 'h-w'

    if (!isSelfLoop) {
      const srcNode = nodes.find(n => n.id === connection.source)
      const tgtNode = nodes.find(n => n.id === connection.target)
      if (srcNode && tgtNode) {
        // 64쌍 전체 비교해서 가장 짧은 핸들 쌍 선택
        const best = getBestHandlePair(
          srcNode.position.x, srcNode.position.y,
          tgtNode.position.x, tgtNode.position.y,
        )
        sh = best.sourceHandle
        th = best.targetHandle
      }
    }

    setPendingEdge({ ...connection, sourceHandle: sh, targetHandle: th })
    setEdgeLabel([])
  }, [nodes])

  const confirmNewEdge = () => {
    if (!pendingEdge || edgeLabel.length === 0) { setPendingEdge(null); return }
    saveHistory()

    const label = edgeLabel.join(',')
    const isSelfLoop = pendingEdge.source === pendingEdge.target
    const sh = pendingEdge.sourceHandle ?? 'h-e'
    const th = pendingEdge.targetHandle ?? 'h-w'

    // 역방향 엣지 존재 여부 확인
    const reverseEdge = edges.find(
      e => e.source === pendingEdge.target && e.target === pendingEdge.source
    )
    const isReverse = !isSelfLoop && !!reverseEdge

    const newEdge: Edge = {
      ...pendingEdge,
      id: `e-${pendingEdge.source}-${pendingEdge.target}-${Date.now()}`,
      type: isSelfLoop ? 'selfLoop' : 'dfa',
      label,
      source: pendingEdge.source!,
      target: pendingEdge.target!,
      sourceHandle: sh,
      targetHandle: th,
      data: {
        bidirOffset: isReverse ? -1 : 0,
      },
      markerEnd: isSelfLoop ? undefined : MARKER,
    }

    // 역방향 엣지가 있으면 bidir 오프셋 +1 부여
    const updatedEdges = isReverse
      ? edges.map(e =>
          e.id === reverseEdge!.id
            ? { ...e, data: { ...e.data, bidirOffset: 1 } }
            : e
        )
      : edges

    // 연결된 도형마다 순차적으로 소리
    edgeLabel.forEach((shape, i) => {
      setTimeout(() => soundManager.playConnect(shape), i * 60)
    })

    setEdges(addEdge(newEdge, updatedEdges))
    setPendingEdge(null)
  }

  // ── 기존 엣지 클릭 → 수정 모달 ───────────────────────────
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setEditingEdge(edge)
    const current = typeof edge.label === 'string'
      ? (edge.label.split(',').map(s => s.trim()).filter(Boolean) as Shape[])
      : []
    setEdgeLabel(current)
  }, [])

  const confirmEditEdge = () => {
    if (!editingEdge) return
    if (edgeLabel.length === 0) { deleteEditingEdge(); return }
    saveHistory()
    setEdges(edges.map(e =>
      e.id === editingEdge.id ? { ...e, label: edgeLabel.join(',') } : e
    ))
    setEditingEdge(null)
  }

  const deleteEditingEdge = () => {
    if (!editingEdge) return
    saveHistory()
    const remaining = edges.filter(e => e.id !== editingEdge.id)

    // 삭제하는 엣지의 역방향이 있으면 bidir 오프셋 초기화
    const reverseEdge = remaining.find(
      e => e.source === editingEdge.target && e.target === editingEdge.source
    )
    const finalEdges = reverseEdge
      ? remaining.map(e =>
          e.id === reverseEdge.id
            ? { ...e, data: { ...e.data, bidirOffset: 0 } }
            : e
        )
      : remaining

    setEdges(finalEdges)
    setEditingEdge(null)
  }

  // ── 캔버스 더블클릭 → 노드 추가 ─────────────────────────
  const onPaneDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addNode({ x: x - NODE_HALF, y: y - NODE_HALF })
    },
    [addNode, screenToFlowPosition]
  )

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault()
      toggleAccepting(node.id)
    },
    [toggleAccepting]
  )

  const isModalOpen = !!pendingEdge || !!editingEdge
  const modalTitle = editingEdge ? '통로 도형 수정' : '통로에 어떤 도형을 넣을까?'

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={(e) => { if (e.detail === 2) onPaneDoubleClick(e) }}
        connectionMode={ConnectionMode.Loose}
        fitView
        deleteKeyCode="Delete"
        defaultEdgeOptions={{ type: 'dfa', markerEnd: MARKER }}
        className="bg-[#FDF6EC]"
      >
        <Background color="#e8d8c0" gap={20} size={1} />
        <Controls />
        <MiniMap nodeColor={() => '#DAEAF8'} maskColor="rgba(253,246,236,0.7)" />
      </ReactFlow>

      {/* 도형 선택 모달 */}
      {isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 min-w-[260px]">
            <p className="font-['Nunito'] font-bold text-stone-700 text-center">
              {modalTitle}
            </p>

            <div className="flex gap-3 justify-center">
              {SHAPES.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setEdgeLabel(prev =>
                      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                    )
                  }
                  className={`
                    w-12 h-12 rounded-xl border-2 transition-all
                    flex items-center justify-center
                    ${edgeLabel.includes(s)
                      ? 'border-[#FF7E6B] bg-[#fff0ec] scale-110'
                      : 'border-stone-200 bg-stone-50'}
                  `}
                >
                  <ShapeIcon shape={s} size={22} />
                </button>
              ))}
            </div>

            {editingEdge ? (
              <div className="flex gap-2">
                <button
                  onClick={deleteEditingEdge}
                  className="flex-1 py-2 rounded-xl border border-red-200 text-red-400 font-['Nunito'] text-sm hover:bg-red-50"
                >
                  삭제
                </button>
                <button
                  onClick={() => setEditingEdge(null)}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] text-sm hover:bg-stone-50"
                >
                  취소
                </button>
                <button
                  onClick={confirmEditEdge}
                  disabled={edgeLabel.length === 0}
                  className="flex-1 py-2 rounded-xl bg-[#5B9BD5] text-white font-['Nunito'] font-bold text-sm disabled:opacity-40 hover:bg-[#4a87bf]"
                >
                  수정
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingEdge(null)}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 font-['Nunito'] hover:bg-stone-50"
                >
                  취소
                </button>
                <button
                  onClick={confirmNewEdge}
                  disabled={edgeLabel.length === 0}
                  className="flex-1 py-2 rounded-xl bg-[#FF7E6B] text-white font-['Nunito'] font-bold disabled:opacity-40 hover:bg-[#e86d5a]"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-stone-400 font-['Nunito'] pointer-events-none select-none">
        더블클릭: 방 추가 &nbsp;|&nbsp; 우클릭: 정답 방 토글 &nbsp;|&nbsp; 통로 클릭: 수정
      </div>
    </div>
  )
}

export default function DFACanvas() {
  return (
    <ReactFlowProvider>
      <DFACanvasInner />
    </ReactFlowProvider>
  )
}
