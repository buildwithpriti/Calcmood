export type CalcState = {
  display: string;
  previous: number | null;
  operator: string | null;
  waiting: boolean;
  expression: string;
  justComputed: boolean;
};

export type CalcAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; op: string }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'backspace' }
  | { type: 'percent' };

export const initialCalcState: CalcState = {
  display: '0',
  previous: null,
  operator: null,
  waiting: false,
  expression: '',
  justComputed: false,
};

const compute = (a: number, b: number, op: string): number => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
};

const formatNumber = (n: number): string => {
  if (!isFinite(n)) return 'Error';
  const rounded = Math.round(n * 1e10) / 1e10;
  if (Math.abs(rounded) >= 1e12) return rounded.toExponential(4);
  return String(rounded);
};

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case 'digit': {
      if (state.display === 'Error' || state.justComputed) {
        return { ...initialCalcState, display: action.digit };
      }
      if (state.waiting) {
        return { ...state, display: action.digit, waiting: false };
      }
      if (state.display === '0') {
        return { ...state, display: action.digit };
      }
      if (state.display.length >= 14) return state;
      return { ...state, display: state.display + action.digit };
    }
    case 'decimal': {
      if (state.display === 'Error' || state.justComputed) {
        return { ...initialCalcState, display: '0.' };
      }
      if (state.waiting) {
        return { ...state, display: '0.', waiting: false };
      }
      if (state.display.includes('.')) return state;
      return { ...state, display: state.display + '.' };
    }
    case 'operator': {
      if (state.display === 'Error') return state;
      const current = parseFloat(state.display);
      if (state.previous === null) {
        return { ...state, previous: current, operator: action.op, waiting: true, expression: `${formatNumber(current)} ${action.op}`, justComputed: false };
      }
      if (state.operator && !state.waiting) {
        const result = compute(state.previous, current, state.operator);
        return { ...state, display: formatNumber(result), previous: result, operator: action.op, waiting: true, expression: `${formatNumber(result)} ${action.op}`, justComputed: false };
      }
      return { ...state, operator: action.op, waiting: true, expression: `${formatNumber(state.previous)} ${action.op}` };
    }
    case 'equals': {
      if (state.operator === null || state.previous === null || state.display === 'Error') return state;
      const current = parseFloat(state.display);
      const result = compute(state.previous, current, state.operator);
      const expression = `${formatNumber(state.previous)} ${state.operator} ${formatNumber(current)} =`;
      return { display: formatNumber(result), previous: null, operator: null, waiting: false, expression, justComputed: true };
    }
    case 'clear':
      return initialCalcState;
    case 'backspace': {
      if (state.display === 'Error' || state.justComputed || state.waiting) return state;
      if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
        return { ...state, display: '0' };
      }
      return { ...state, display: state.display.slice(0, -1) };
    }
    case 'percent': {
      if (state.display === 'Error') return state;
      const current = parseFloat(state.display);
      const result = current / 100;
      return { ...state, display: formatNumber(result), justComputed: false };
    }
    default:
      return state;
  }
}
