export type Shape = '★' | '●' | '■'

export type TransitionMap = Record<string, Record<Shape, string>>

export interface DFADefinition {
  states: string[]
  alphabet: Shape[]
  initial: string
  accepting: string[]
  transitions: TransitionMap
}

export interface TestCase {
  input: Shape[]
  expected: boolean
}

export interface Level {
  id: number
  world: number          // 1~5
  title: string
  story: string          // 미션 카드 텍스트
  description: string
  hint?: string
  alpha: Shape[]         // 이 레벨에서 사용하는 알파벳
  testCases: TestCase[]
  solution: DFADefinition
  minStates: number
  minRooms: number       // 최소 방 수 (별점 기준)
}

// ─── Level 1 ─────────────────────────────────────────────────────────────────
const level1: Level = {
  id: 1, world: 1,
  title: '별로 끝내기',
  story: '왕국의 문지기는 마지막 손님이 ★일 때만 문을 열어줘. 미로를 만들어봐!',
  description: '★로 끝나는 도형 열만 통과시켜봐!',
  hint: '마지막에 ★을 받으면 정답 방(이중 원)으로 가면 돼. 방이 2개면 충분해.',
  alpha: ['★', '●', '■'],
  minStates: 2, minRooms: 2,
  testCases: [
    { input: ['★'],           expected: true  },
    { input: ['●', '★'],      expected: true  },
    { input: ['■', '●', '★'], expected: true  },
    { input: ['★', '●'],      expected: false },
    { input: ['●'],           expected: false },
    { input: ['■', '■'],      expected: false },
    { input: ['★', '★'],      expected: true  },
    { input: ['●', '■', '●'], expected: false },
  ],
  solution: {
    states: ['q0', 'q1'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q1'],
    transitions: {
      q0: { '★': 'q1', '●': 'q0', '■': 'q0' },
      q1: { '★': 'q1', '●': 'q0', '■': 'q0' },
    },
  },
}

// ─── Level 2 ─────────────────────────────────────────────────────────────────
const level2: Level = {
  id: 2, world: 1,
  title: '짝수 개의 원',
  story: '마법 저울은 ●이 짝수 개일 때만 균형이 맞아. 0개도 짝수야!',
  description: '●이 짝수 번 나오는 열만 통과! 0개도 짝수야.',
  hint: '●을 만날 때마다 홀수↔짝수 방을 오가면 돼. 방이 2개면 충분해.',
  alpha: ['★', '●', '■'],
  minStates: 2, minRooms: 2,
  testCases: [
    { input: [],                          expected: true  },
    { input: ['●'],                       expected: false },
    { input: ['●', '●'],                  expected: true  },
    { input: ['★', '●', '★'],            expected: false },
    { input: ['●', '★', '●'],            expected: true  },
    { input: ['■', '■', '■'],            expected: true  },
    { input: ['●', '●', '●'],            expected: false },
    { input: ['★', '●', '■', '●', '★'], expected: true  },
  ],
  solution: {
    states: ['even', 'odd'], alphabet: ['★', '●', '■'],
    initial: 'even', accepting: ['even'],
    transitions: {
      even: { '★': 'even', '●': 'odd',  '■': 'even' },
      odd:  { '★': 'odd',  '●': 'even', '■': 'odd'  },
    },
  },
}

// ─── Level 3 ─────────────────────────────────────────────────────────────────
const level3: Level = {
  id: 3, world: 2,
  title: '네모 없는 길',
  story: '■가 숨어 있으면 함정이 터져! ■이 단 한 번도 없는 열만 통과시켜.',
  description: '■이 한 번도 등장하지 않는 열만 통과!',
  hint: '■을 한 번이라도 보면 다시는 통과 못 하는 방으로 보내봐.',
  alpha: ['★', '●', '■'],
  minStates: 2, minRooms: 2,
  testCases: [
    { input: [],                   expected: true  },
    { input: ['★', '★'],           expected: true  },
    { input: ['●', '●'],           expected: true  },
    { input: ['■'],                expected: false },
    { input: ['★', '■'],           expected: false },
    { input: ['●', '●', '●'],     expected: true  },
    { input: ['★', '●', '■', '★'],expected: false },
    { input: ['★', '●'],           expected: true  },
  ],
  solution: {
    states: ['q0', 'q1'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q0'],
    transitions: {
      q0: { '★': 'q0', '●': 'q0', '■': 'q1' },
      q1: { '★': 'q1', '●': 'q1', '■': 'q1' },
    },
  },
}

// ─── Level 4 ─────────────────────────────────────────────────────────────────
const level4: Level = {
  id: 4, world: 2,
  title: '별로 시작하기',
  story: '왕의 칙령은 반드시 ★으로 시작해야 해. 첫 도형을 확인하는 미로를 만들어봐.',
  description: '★으로 시작하는 도형 열만 통과!',
  hint: '첫 도형이 ★이 아니면 영원히 막히는 죽은 방으로 보내봐. 방 3개가 필요해.',
  alpha: ['★', '●', '■'],
  minStates: 3, minRooms: 3,
  testCases: [
    { input: ['★'],             expected: true  },
    { input: ['★', '●', '■'],  expected: true  },
    { input: ['★', '★', '★'],  expected: true  },
    { input: ['●'],             expected: false },
    { input: ['■', '★'],        expected: false },
    { input: ['●', '★'],        expected: false },
    { input: ['★', '●', '★'],  expected: true  },
    { input: [],                expected: false },
  ],
  solution: {
    states: ['q0', 'q1', 'q2'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q1'],
    transitions: {
      q0: { '★': 'q1', '●': 'q2', '■': 'q2' },
      q1: { '★': 'q1', '●': 'q1', '■': 'q1' },
      q2: { '★': 'q2', '●': 'q2', '■': 'q2' },
    },
  },
}

// ─── Level 5 ─────────────────────────────────────────────────────────────────
const level5: Level = {
  id: 5, world: 3,
  title: '별-원-네모 콤보',
  story: '고대 주문의 비밀: ★ 다음 ● 다음 ■ 순서가 어딘가에 나와야 마법이 발동해!',
  description: '★→●→■ 순서가 어딘가에 포함된 열만 통과!',
  hint: '★을 기다렸다 ●, 그 다음 ■ 확인. 방 4개가 필요해.',
  alpha: ['★', '●', '■'],
  minStates: 4, minRooms: 4,
  testCases: [
    { input: ['★', '●', '■'],            expected: true  },
    { input: ['■', '★', '●', '■'],       expected: true  },
    { input: ['★', '●', '★', '●', '■'], expected: true  },
    { input: ['★', '■'],                 expected: false },
    { input: ['●', '■'],                 expected: false },
    { input: ['★', '★', '●', '■'],      expected: true  },
    { input: ['■', '●', '★'],            expected: false },
    { input: ['★', '●'],                 expected: false },
  ],
  solution: {
    states: ['q0', 'q1', 'q2', 'q3'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q3'],
    transitions: {
      q0: { '★': 'q1', '●': 'q0', '■': 'q0' },
      q1: { '★': 'q1', '●': 'q2', '■': 'q0' },
      q2: { '★': 'q1', '●': 'q0', '■': 'q3' },
      q3: { '★': 'q3', '●': 'q3', '■': 'q3' },
    },
  },
}

// ─── Level 6 ─────────────────────────────────────────────────────────────────
const level6: Level = {
  id: 6, world: 3,
  title: '원이 두 번 연속',
  story: '쌍둥이 ●●이 나란히 나타나야 비밀 문이 열려! 연속으로 두 번을 찾아내.',
  description: '●●이 연속으로 나오는 열만 통과!',
  hint: '● 하나를 봤을 때 또 ●이 오면 정답 방으로. 방 3개면 충분해.',
  alpha: ['★', '●', '■'],
  minStates: 3, minRooms: 3,
  testCases: [
    { input: ['●', '●'],                     expected: true  },
    { input: ['★', '●', '●'],               expected: true  },
    { input: ['●', '●', '■'],               expected: true  },
    { input: ['●'],                           expected: false },
    { input: ['●', '★', '●'],               expected: false },
    { input: ['■', '■', '■'],               expected: false },
    { input: ['★', '●', '★', '●', '●'],   expected: true  },
    { input: ['●', '■', '●'],               expected: false },
  ],
  solution: {
    states: ['q0', 'q1', 'q2'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q2'],
    transitions: {
      q0: { '★': 'q0', '●': 'q1', '■': 'q0' },
      q1: { '★': 'q0', '●': 'q2', '■': 'q0' },
      q2: { '★': 'q2', '●': 'q2', '■': 'q2' },
    },
  },
}

// ─── Level 7 ─────────────────────────────────────────────────────────────────
const level7: Level = {
  id: 7, world: 4,
  title: '별 세 개씩',
  story: '별의 리듬을 타라! ★의 개수가 3의 배수(0, 3, 6…)일 때만 통과야.',
  description: '★의 개수가 3의 배수인 열만 통과! (0개도 통과)',
  hint: '★을 셀 때마다 0→1→2→0 순환. 방 3개가 필요해.',
  alpha: ['★', '●', '■'],
  minStates: 3, minRooms: 3,
  testCases: [
    { input: [],                          expected: true  },
    { input: ['★'],                       expected: false },
    { input: ['★', '★'],                  expected: false },
    { input: ['★', '★', '★'],            expected: true  },
    { input: ['●', '●'],                  expected: true  },
    { input: ['★', '●', '★', '●', '★'], expected: true  },
    { input: ['★', '★', '★', '★'],      expected: false },
    { input: ['★', '★', '●', '★'],      expected: true  },
  ],
  solution: {
    states: ['q0', 'q1', 'q2'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q0'],
    transitions: {
      q0: { '★': 'q1', '●': 'q0', '■': 'q0' },
      q1: { '★': 'q2', '●': 'q1', '■': 'q1' },
      q2: { '★': 'q0', '●': 'q2', '■': 'q2' },
    },
  },
}

// ─── Level 8 ─────────────────────────────────────────────────────────────────
const level8: Level = {
  id: 8, world: 4,
  title: '원 세 번 연속 금지',
  story: '●●●이 연속으로 세 번 나오면 폭발! 두 번까지만 허용하는 미로를 만들어.',
  description: '●이 세 번 이상 연속으로 나오지 않는 열만 통과!',
  hint: '연속 ● 개수를 0, 1, 2, 3+로 추적. 3+는 죽은 방이야. 방 4개가 필요해.',
  alpha: ['★', '●', '■'],
  minStates: 4, minRooms: 4,
  testCases: [
    { input: [],                             expected: true  },
    { input: ['●', '●'],                     expected: true  },
    { input: ['●', '●', '●'],               expected: false },
    { input: ['★', '●', '●', '★'],         expected: true  },
    { input: ['●', '●', '●', '●'],         expected: false },
    { input: ['●', '●', '★', '●', '●'],   expected: true  },
    { input: ['★', '●', '●', '●', '★'],   expected: false },
    { input: ['●', '●', '■', '●', '●'],   expected: true  },
  ],
  solution: {
    states: ['q0', 'q1', 'q2', 'q3'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q0', 'q1', 'q2'],
    transitions: {
      q0: { '★': 'q0', '●': 'q1', '■': 'q0' },
      q1: { '★': 'q0', '●': 'q2', '■': 'q0' },
      q2: { '★': 'q0', '●': 'q3', '■': 'q0' },
      q3: { '★': 'q3', '●': 'q3', '■': 'q3' },
    },
  },
}

// ─── Level 9 ─────────────────────────────────────────────────────────────────
const level9: Level = {
  id: 9, world: 5,
  title: '별 뒤에 네모 금지',
  story: '★ 바로 다음에 ■이 오면 저주가 걸려! 이 패턴을 완전히 차단해.',
  description: '★ 바로 뒤에 ■이 없는 열만 통과!',
  hint: '★을 봤을 때 다음이 ■이면 죽은 방으로. 정답 방은 2개야.',
  alpha: ['★', '●', '■'],
  minStates: 3, minRooms: 3,
  testCases: [
    { input: [],               expected: true  },
    { input: ['★', '●'],      expected: true  },
    { input: ['★', '★'],      expected: true  },
    { input: ['★', '■'],      expected: false },
    { input: ['●', '★', '■'],expected: false  },
    { input: ['★', '●', '■'],expected: true   },
    { input: ['■', '★', '●'],expected: true   },
    { input: ['★', '★', '■'],expected: false  },
  ],
  solution: {
    states: ['q0', 'q1', 'q2'], alphabet: ['★', '●', '■'],
    initial: 'q0', accepting: ['q0', 'q1'],
    transitions: {
      q0: { '★': 'q1', '●': 'q0', '■': 'q0' },
      q1: { '★': 'q1', '●': 'q0', '■': 'q2' },
      q2: { '★': 'q2', '●': 'q2', '■': 'q2' },
    },
  },
}

// ─── Level 10 ────────────────────────────────────────────────────────────────
const level10: Level = {
  id: 10, world: 5,
  title: '별도 짝수, 원도 짝수',
  story: '우주의 균형 법칙: ★의 개수도 짝수, ●의 개수도 짝수여야 세계가 안정돼!',
  description: '★의 개수와 ●의 개수가 모두 짝수인 열만 통과!',
  hint: '(★홀짝, ●홀짝) 조합으로 방이 4개 필요해. 둘 다 짝수인 방만 정답이야.',
  alpha: ['★', '●', '■'],
  minStates: 4, minRooms: 4,
  testCases: [
    { input: [],                              expected: true  },
    { input: ['★', '★'],                      expected: true  },
    { input: ['●', '●'],                      expected: true  },
    { input: ['★', '●'],                      expected: false },
    { input: ['★', '★', '●', '●'],           expected: true  },
    { input: ['★', '●', '★', '●'],           expected: true  },
    { input: ['★', '★', '★'],                expected: false },
    { input: ['●', '●', '●', '●', '●'],      expected: false },
    { input: ['★', '●', '■', '●', '★'],      expected: true  },
    { input: ['★', '●', '●', '●'],           expected: false },
  ],
  solution: {
    states: ['ee', 'eo', 'oe', 'oo'], alphabet: ['★', '●', '■'],
    initial: 'ee', accepting: ['ee'],
    transitions: {
      ee: { '★': 'oe', '●': 'eo', '■': 'ee' },
      eo: { '★': 'oo', '●': 'ee', '■': 'eo' },
      oe: { '★': 'ee', '●': 'oo', '■': 'oe' },
      oo: { '★': 'eo', '●': 'oe', '■': 'oo' },
    },
  },
}

export const LEVELS: Level[] = [
  level1, level2, level3, level4, level5,
  level6, level7, level8, level9, level10,
]

export const WORLD_TITLES: Record<number, string> = {
  1: '도형 탐험가',
  2: '도형 수련생',
  3: '도형 기사',
  4: '도형 마법사',
  5: '도형 현자',
}
