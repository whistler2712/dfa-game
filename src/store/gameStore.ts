import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Node, Edge } from 'reactflow'
import { LEVELS, Level, Shape } from '@/lib/levels'
import {
  rfToDFA,
  runTests,
  validateDFA,
  simulate as simulateDFA,
  TestResult,
  ValidationError,
} from '@/lib/simulate'
import { soundManager } from '@/lib/sounds'

export type GamePhase = 'playing' | 'cleared' | 'failed' | 'gameover'

export const STAR_SCORE: Record<number, number> = { 1: 25, 2: 60, 3: 100 }

interface NodeData {
  label: string
  isInitial: boolean
  isAccepting: boolean
}

interface HistoryEntry {
  nodes: Node<NodeData>[]
  edges: Edge[]
}

interface GameState {
  // ─── Persisted ────────────────────────────────────────────────────────────
  clearedLevels: Record<number, number>   // levelIndex → best stars (1~3)
  totalScore: number

  // ─── Level ────────────────────────────────────────────────────────────────
  currentLevelIndex: number
  level: Level

  // ─── Canvas ───────────────────────────────────────────────────────────────
  nodes: Node<NodeData>[]
  edges: Edge[]

  // ─── Undo history ─────────────────────────────────────────────────────────
  history: HistoryEntry[]

  // ─── Per-run state ────────────────────────────────────────────────────────
  phase: GamePhase
  lives: number
  stars: number           // 마지막 클리어 별점 (0~3)
  hintUsed: boolean
  showHint: boolean

  // ─── Check results ────────────────────────────────────────────────────────
  testResults: TestResult[]
  validationErrors: ValidationError[]

  // ─── Test sequence ────────────────────────────────────────────────────────
  testSequence: Shape[]
  testSeqResult: 'accept' | 'reject' | 'invalid' | null

  // ─── Actions ──────────────────────────────────────────────────────────────
  setNodes: (nodes: Node<NodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (position: { x: number; y: number }) => void
  toggleAccepting: (nodeId: string) => void
  setInitial: (nodeId: string) => void

  saveHistory: () => void
  undo: () => void

  loadLevel: (index: number) => void
  checkSolution: () => void
  nextLevel: () => void
  resetLevel: () => void
  resetGame: () => void
  useHint: () => void

  addToSequence: (shape: Shape) => void
  removeFromSequence: (idx: number) => void
  clearSequence: () => void
  runSequence: () => void
}

// ─── Node counter helpers ─────────────────────────────────────────────────────
let nodeCounter = 1
let roomNumber = 2

function initialNodes(): Node<NodeData>[] {
  nodeCounter = 1
  roomNumber = 2
  return [{
    id: 'q0',
    type: 'dfaState',
    position: { x: 200, y: 200 },
    data: { label: '방 1', isInitial: true, isAccepting: false },
  }]
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Persisted defaults (overwritten by localStorage on hydration)
      clearedLevels: {},
      totalScore: 0,

      // Session defaults
      currentLevelIndex: 0,
      level: LEVELS[0],
      nodes: initialNodes(),
      edges: [],
      history: [],
      phase: 'playing',
      lives: 3,
      stars: 0,
      hintUsed: false,
      showHint: false,
      testResults: [],
      validationErrors: [],
      testSequence: [],
      testSeqResult: null,

      // ── Undo history ─────────────────────────────────────────────────────
      saveHistory: () => {
        const { nodes, edges, history } = get()
        const entry: HistoryEntry = {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        }
        set({ history: [...history, entry].slice(-20) })
      },

      undo: () => {
        const { history } = get()
        if (history.length === 0) return
        const prev = history[history.length - 1]
        soundManager.playUndo()
        set({
          nodes: prev.nodes,
          edges: prev.edges,
          history: history.slice(0, -1),
          testResults: [],
          validationErrors: [],
        })
      },

      // ── Canvas ──────────────────────────────────────────────────────────
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (position) => {
        get().saveHistory()
        const { nodes } = get()
        const id = `q${nodeCounter++}`
        const label = `방 ${roomNumber++}`
        soundManager.playAddNode()
        set({
          nodes: [...nodes, {
            id, type: 'dfaState', position,
            data: { label, isInitial: false, isAccepting: false },
          }],
        })
      },

      toggleAccepting: (nodeId) => {
        get().saveHistory()
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, isAccepting: !n.data.isAccepting } }
              : n
          ),
        }))
      },

      setInitial: (nodeId) => set((s) => ({
        nodes: s.nodes.map((n) => ({
          ...n, data: { ...n.data, isInitial: n.id === nodeId },
        })),
      })),

      // ── Load level ──────────────────────────────────────────────────────
      loadLevel: (index) => {
        if (index < 0 || index >= LEVELS.length) return
        nodeCounter = 1; roomNumber = 2
        set({
          currentLevelIndex: index,
          level: LEVELS[index],
          nodes: initialNodes(),
          edges: [],
          history: [],
          phase: 'playing',
          lives: 3,
          hintUsed: false,
          showHint: false,
          stars: 0,
          testResults: [],
          validationErrors: [],
          testSequence: [],
          testSeqResult: null,
        })
      },

      // ── Check solution ───────────────────────────────────────────────────
      checkSolution: () => {
        const {
          nodes, edges, level, hintUsed, lives,
          clearedLevels, totalScore, currentLevelIndex,
        } = get()

        const rfNodes = nodes.map((n) => ({
          id: n.id,
          data: { isInitial: n.data.isInitial, isAccepting: n.data.isAccepting },
        }))
        const rfEdges = edges.map((e) => ({
          id: e.id, source: e.source, target: e.target,
          label: typeof e.label === 'string' ? e.label : '',
        }))

        const dfa = rfToDFA(rfNodes, rfEdges)
        const valErrors = validateDFA(dfa, level.solution.alphabet)

        if (valErrors.length > 0) {
          set({ validationErrors: valErrors, testResults: [], phase: 'failed' })
          return
        }

        const results = runTests(dfa, level.testCases)
        const allPass = results.every((r) => r.pass)

        if (allPass) {
          const stars = hintUsed ? 1 : nodes.length <= level.minRooms ? 3 : 2
          const points = STAR_SCORE[stars]
          const newScore = totalScore + points
          const prevBest = clearedLevels[currentLevelIndex] ?? 0
          const newCleared = stars > prevBest
            ? { ...clearedLevels, [currentLevelIndex]: stars }
            : clearedLevels

          soundManager.playCorrect()
          set({
            testResults: results,
            validationErrors: [],
            phase: 'cleared',
            stars,
            totalScore: newScore,
            clearedLevels: newCleared,
          })
        } else {
          const newLives = lives - 1
          soundManager.playWrong()
          set({
            testResults: results,
            validationErrors: [],
            phase: newLives <= 0 ? 'gameover' : 'failed',
            lives: Math.max(0, newLives),
          })
        }
      },

      // ── Level navigation ─────────────────────────────────────────────────
      nextLevel: () => {
        const next = get().currentLevelIndex + 1
        if (next >= LEVELS.length) return
        nodeCounter = 1; roomNumber = 2
        set({
          currentLevelIndex: next,
          level: LEVELS[next],
          nodes: initialNodes(),
          edges: [],
          history: [],
          phase: 'playing',
          hintUsed: false,
          showHint: false,
          stars: 0,
          testResults: [],
          validationErrors: [],
          testSequence: [],
          testSeqResult: null,
        })
      },

      resetLevel: () => {
        nodeCounter = 1; roomNumber = 2
        set({
          nodes: initialNodes(),
          edges: [],
          history: [],
          phase: 'playing',
          testResults: [],
          validationErrors: [],
          stars: 0,
          testSequence: [],
          testSeqResult: null,
        })
      },

      resetGame: () => {
        nodeCounter = 1; roomNumber = 2
        set({
          currentLevelIndex: 0,
          level: LEVELS[0],
          nodes: initialNodes(),
          edges: [],
          history: [],
          phase: 'playing',
          lives: 3,
          hintUsed: false,
          showHint: false,
          stars: 0,
          totalScore: 0,
          testResults: [],
          validationErrors: [],
          testSequence: [],
          testSeqResult: null,
        })
      },

      // ── Hint ─────────────────────────────────────────────────────────────
      useHint: () => set({ hintUsed: true, showHint: true }),

      // ── Test sequence ────────────────────────────────────────────────────
      addToSequence: (shape) =>
        set((s) => ({ testSequence: [...s.testSequence, shape], testSeqResult: null })),

      removeFromSequence: (idx) =>
        set((s) => ({
          testSequence: s.testSequence.filter((_, i) => i !== idx),
          testSeqResult: null,
        })),

      clearSequence: () => set({ testSequence: [], testSeqResult: null }),

      runSequence: () => {
        const { nodes, edges, level, testSequence } = get()
        const rfNodes = nodes.map((n) => ({
          id: n.id,
          data: { isInitial: n.data.isInitial, isAccepting: n.data.isAccepting },
        }))
        const rfEdges = edges.map((e) => ({
          id: e.id, source: e.source, target: e.target,
          label: typeof e.label === 'string' ? e.label : '',
        }))
        const dfa = rfToDFA(rfNodes, rfEdges)
        const valErrors = validateDFA(dfa, level.solution.alphabet)
        if (valErrors.length > 0) { set({ testSeqResult: 'invalid' }); return }
        set({ testSeqResult: simulateDFA(dfa, testSequence) })
      },
    }),
    {
      name: 'dfa-game-save',
      partialize: (state) => ({
        clearedLevels: state.clearedLevels,
        totalScore: state.totalScore,
      }),
    }
  )
)
