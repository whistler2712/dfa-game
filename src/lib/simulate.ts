import type { Shape, DFADefinition, TestCase } from './levels'

// 플레이어가 그린 DFA를 나타내는 타입 (ReactFlow 노드/엣지에서 변환)
export interface PlayerDFA {
  states: string[]
  initial: string
  accepting: string[]
  // transitions[from][shape] = to  (없으면 undefined → reject)
  transitions: Partial<Record<string, Partial<Record<Shape, string>>>>
}

export type SimResult = 'accept' | 'reject' | 'invalid'

/**
 * 주어진 DFA로 입력 열을 시뮬레이션.
 * 전이가 정의되지 않으면 즉시 'reject'.
 */
export function simulate(dfa: PlayerDFA, input: Shape[]): SimResult {
  if (!dfa.initial || !dfa.states.includes(dfa.initial)) return 'invalid'

  let current = dfa.initial
  for (const symbol of input) {
    const next = dfa.transitions[current]?.[symbol]
    if (next === undefined) return 'reject'
    current = next
  }
  return dfa.accepting.includes(current) ? 'accept' : 'reject'
}

export interface TestResult {
  input: Shape[]
  expected: boolean
  actual: SimResult
  pass: boolean
}

/**
 * 모든 테스트케이스를 돌려서 결과 배열 반환.
 */
export function runTests(dfa: PlayerDFA, testCases: TestCase[]): TestResult[] {
  return testCases.map((tc) => {
    const actual = simulate(dfa, tc.input)
    const pass =
      actual === 'invalid'
        ? false
        : (actual === 'accept') === tc.expected
    return { input: tc.input, expected: tc.expected, actual, pass }
  })
}

/**
 * DFA 유효성 검사:
 * - 시작 상태 존재 여부
 * - 수락 상태가 states에 포함되는지
 * - 모든 상태에서 모든 알파벳에 전이가 정의됐는지 (완전 DFA)
 */
export interface ValidationError {
  type: 'no_initial' | 'no_states' | 'missing_transition' | 'invalid_accepting'
  message: string
}

export function validateDFA(
  dfa: PlayerDFA,
  alphabet: Shape[]
): ValidationError[] {
  const errors: ValidationError[] = []

  if (dfa.states.length === 0) {
    errors.push({ type: 'no_states', message: '방이 하나도 없어!' })
    return errors
  }
  if (!dfa.initial || !dfa.states.includes(dfa.initial)) {
    errors.push({ type: 'no_initial', message: '시작 방이 없어!' })
  }
  for (const acc of dfa.accepting) {
    if (!dfa.states.includes(acc)) {
      errors.push({
        type: 'invalid_accepting',
        message: `정답 방 "${acc}"이 존재하지 않아.`,
      })
    }
  }
  for (const state of dfa.states) {
    for (const sym of alphabet) {
      if (dfa.transitions[state]?.[sym] === undefined) {
        errors.push({
          type: 'missing_transition',
          message: `"${state}" 방에서 ${sym} 통로가 없어!`,
        })
      }
    }
  }
  return errors
}

/**
 * ReactFlow 노드/엣지를 PlayerDFA로 변환하는 헬퍼.
 * 엣지 label은 쉼표 구분 도형 문자열 (예: "★,●").
 */
export interface RFNode {
  id: string
  data: { isInitial?: boolean; isAccepting?: boolean }
}

export interface RFEdge {
  id: string
  source: string
  target: string
  label?: string
}

export function rfToDFA(nodes: RFNode[], edges: RFEdge[]): PlayerDFA {
  const states = nodes.map((n) => n.id)
  const initial = nodes.find((n) => n.data.isInitial)?.id ?? ''
  const accepting = nodes.filter((n) => n.data.isAccepting).map((n) => n.id)

  const transitions: PlayerDFA['transitions'] = {}
  for (const edge of edges) {
    if (!edge.label) continue
    const symbols = edge.label.split(',').map((s) => s.trim()) as Shape[]
    if (!transitions[edge.source]) transitions[edge.source] = {}
    for (const sym of symbols) {
      transitions[edge.source]![sym] = edge.target
    }
  }
  return { states, initial, accepting, transitions }
}
