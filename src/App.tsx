import { useEffect, useMemo, useReducer, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Copy, Delete, Divide, Equal, Info, Menu, Minus, Moon, Percent, Plus, RotateCcw, Share2, Sparkles, Sun, X } from 'lucide-react';
import { calculatorList, getCalculator, lifeResults, standardTaglines, type CalculatorId, type Result } from '@/lib/calculators';
import { calcReducer, initialCalcState, type CalcAction } from '@/lib/standardCalc';
import { randomLifeResult, shareResult, shareText } from '@/lib/utils';

type Toast = string | null;

type NavProps = {
  dark: boolean;
  onToggleTheme: () => void;
  onNavigate: (section: string) => void;
};

const colorStyles: Record<string, string> = {
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300',
  violet: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-300',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300',
  indigo: 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300',
};

function Navbar({ dark, onToggleTheme, onNavigate }: NavProps) {
  const [open, setOpen] = useState(false);
  const navigate = (section: string) => { onNavigate(section); setOpen(false); };
  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
        <button onClick={() => navigate('home')} className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight" aria-label="Go home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white shadow-lg shadow-brand-500/25">😂</span>
          <span>Relatable <span className="text-brand-500">Calculator</span></span>
        </button>
        <nav className="hidden items-center gap-7 md:flex">
          <button onClick={() => navigate('home')} className="text-sm font-semibold text-ink-600 transition hover:text-brand-500 dark:text-ink-300">Home</button>
          <button onClick={() => navigate('standard')} className="text-sm font-semibold text-ink-600 transition hover:text-brand-500 dark:text-ink-300">Standard Calc</button>
          <button onClick={() => navigate('calculators')} className="text-sm font-semibold text-ink-600 transition hover:text-brand-500 dark:text-ink-300">Calculators</button>
          <button onClick={() => navigate('random')} className="text-sm font-semibold text-ink-600 transition hover:text-brand-500 dark:text-ink-300">Random 😂</button>
          <button onClick={() => navigate('about')} className="text-sm font-semibold text-ink-600 transition hover:text-brand-500 dark:text-ink-300">About</button>
          <button onClick={onToggleTheme} className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 text-ink-600 transition hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200 dark:hover:bg-white/15" aria-label="Toggle dark mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={onToggleTheme} className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-200" aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 dark:bg-white/10" aria-label="Open menu">{open ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </div>
      {open && <nav className="border-t border-ink-200/60 px-5 py-3 md:hidden dark:border-white/10">
        {[{id:'home',label:'Home'},{id:'standard',label:'Standard Calc'},{id:'calculators',label:'Calculators'},{id:'random',label:'Random 😂'},{id:'about',label:'About'}].map((item) => <button key={item.id} onClick={() => navigate(item.id)} className="block w-full py-3 text-left text-sm font-semibold text-ink-600 dark:text-ink-200">{item.label}</button>)}
      </nav>}
    </header>
  );
}

function CalculatorCard({ id, onClick }: { id: CalculatorId; onClick: () => void }) {
  const calculator = getCalculator(id);
  return <article className="group card flex h-full flex-col transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10">
    <div className="flex items-start justify-between"><div className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${colorStyles[calculator.color]}`}>{calculator.emoji}</div><span className="rounded-full bg-ink-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400 dark:bg-white/10">Fun only</span></div>
    <h3 className="mt-5 text-xl font-bold">{calculator.name}</h3>
    <p className="mt-2 flex-1 text-sm leading-6 text-ink-500 dark:text-ink-400">{calculator.description}</p>
    <button onClick={onClick} className="btn-ghost mt-6 w-full group-hover:bg-brand-500 group-hover:text-white group-hover:ring-brand-500"><span>Calculate</span> <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button>
  </article>;
}

function CalculatorModal({ id, onClose, onResult }: { id: CalculatorId; onClose: () => void; onResult: (result: Result) => void }) {
  const calculator = getCalculator(id);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(calculator.fields.map((field) => [field.name, field.type === 'time' ? (field.name === 'wake' ? '07:00' : '23:00') : ''])));
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const missing = calculator.fields.find((field) => values[field.name] === '' || Number.isNaN(Number(values[field.name])) || (field.type === 'number' && Number(values[field.name]) < (field.min ?? 0)));
    if (missing) { setError(`Please enter a valid value for “${missing.label}”.`); return; }
    if (id === 'exam' && Number(values.correct) > Number(values.total)) { setError('Correct answers cannot be more than total marks. Nice try though.'); return; }
    if (id === 'procrastination' && Number(values.procrastinated) > 24) { setError('That is an impressive amount of procrastination, but keep it under 24 hours.'); return; }
    onResult(calculator.calculate(values));
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="card max-h-[90vh] w-full max-w-lg animate-pop-in overflow-y-auto bg-white dark:bg-ink-800">
      <div className="mb-6 flex items-start justify-between"><div className="flex items-center gap-4"><span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${colorStyles[calculator.color]}`}>{calculator.emoji}</span><div><h2 id="modal-title" className="text-2xl font-bold">{calculator.name}</h2><p className="text-sm text-ink-500 dark:text-ink-400">Be honest. The calculator knows.</p></div></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-white/10" aria-label="Close"><X size={18} /></button></div>
      <form onSubmit={submit} className="space-y-4">{calculator.fields.map((field) => <div key={field.name}><label className="field-label" htmlFor={field.name}>{field.label}</label><div className="relative">{field.prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-400">{field.prefix}</span>}<input id={field.name} className={`field-input ${field.prefix ? 'pl-9' : ''}`} type={field.type} value={values[field.name]} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder} onChange={(event) => { setValues({ ...values, [field.name]: event.target.value }); setError(''); }} required /></div></div>)}
        {error && <p className="animate-shake rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-400/10 dark:text-rose-300" role="alert">{error}</p>}
        <button className="btn-primary mt-2 w-full" type="submit">Calculate my fate <Sparkles size={17} /></button>
      </form>
      {id === 'exam' && <p className="mt-5 text-center text-xs text-ink-400">For entertainment only. Not a scientifically accurate prediction.</p>}
    </div>
  </div>;
}

function StandardCalculator({ onToast }: { onToast: (message: string) => void }) {
  const [state, dispatch] = useReducer(calcReducer, initialCalcState);
  const [tagline, setTagline] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = (action: CalcAction) => {
    if (action.type === 'equals') {
      if (state.operator === null || state.previous === null || state.display === 'Error') return;
      setLoading(true);
      setTagline(null);
      window.setTimeout(() => {
        dispatch({ type: 'equals' });
        setTagline(standardTaglines[Math.floor(Math.random() * standardTaglines.length)]);
        setLoading(false);
      }, 450);
      return;
    }
    if (action.type === 'clear') setTagline(null);
    dispatch(action);
  };

  const handleShare = async () => {
    const text = `${state.expression || state.display} ${state.display}\n${tagline ?? ''}`;
    try {
      const method = await shareText(text);
      onToast(method === 'shared' ? 'Share sheet opened!' : 'Result copied to clipboard!');
    } catch {
      onToast('No worries, your result is still iconic.');
    }
  };

  const buttons: { label: string; action: CalcAction; className: string; icon?: React.ReactNode }[] = [
    { label: 'AC', action: { type: 'clear' }, className: 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-300' },
    { label: '⌫', action: { type: 'backspace' }, className: 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200', icon: <Delete size={20} /> },
    { label: '%', action: { type: 'percent' }, className: 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-200', icon: <Percent size={20} /> },
    { label: '÷', action: { type: 'operator', op: '÷' }, className: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300', icon: <Divide size={20} /> },
    { label: '7', action: { type: 'digit', digit: '7' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '8', action: { type: 'digit', digit: '8' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '9', action: { type: 'digit', digit: '9' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '×', action: { type: 'operator', op: '×' }, className: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300', icon: <Plus size={20} className="rotate-45" /> },
    { label: '4', action: { type: 'digit', digit: '4' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '5', action: { type: 'digit', digit: '5' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '6', action: { type: 'digit', digit: '6' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '−', action: { type: 'operator', op: '-' }, className: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300', icon: <Minus size={20} /> },
    { label: '1', action: { type: 'digit', digit: '1' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '2', action: { type: 'digit', digit: '2' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '3', action: { type: 'digit', digit: '3' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '+', action: { type: 'operator', op: '+' }, className: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300', icon: <Plus size={20} /> },
    { label: '0', action: { type: 'digit', digit: '0' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50 col-span-2' },
    { label: '.', action: { type: 'decimal' }, className: 'bg-white text-ink-800 hover:bg-ink-50 dark:bg-ink-800/50 dark:text-ink-50 dark:hover:bg-ink-700/50' },
    { label: '=', action: { type: 'equals' }, className: 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/30', icon: <Equal size={20} /> },
  ];

  return (
    <div className="card mx-auto max-w-sm bg-white/90 p-6 shadow-2xl shadow-brand-500/10 dark:bg-ink-800/80 sm:p-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-lg dark:bg-brand-400/10">🧮</span>
          <h3 className="font-display text-lg font-bold">Standard Calc</h3>
        </div>
        <button onClick={() => { dispatch({ type: 'clear' }); setTagline(null); }} className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-ink-500 transition hover:bg-ink-200 active:scale-90 dark:bg-white/10 dark:text-ink-200" aria-label="Reset calculator"><RotateCcw size={16} /></button>
      </div>
      <div className="mb-4 rounded-2xl bg-ink-900 p-5 text-right shadow-inner dark:bg-ink-950">
        <div className="min-h-[20px] text-sm font-medium text-ink-400">{state.expression || '\u00A0'}</div>
        <div className={`mt-1 truncate font-display text-4xl font-extrabold tracking-tight text-white ${loading ? 'animate-pulse' : ''}`}>{loading ? '...' : state.display}</div>
      </div>
      {tagline && <div className="mb-4 animate-pop-in rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm font-bold text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">{tagline}</div>}
      <div className="grid grid-cols-4 gap-2.5">
        {buttons.map((button) => (
          <button
            key={button.label}
            onClick={() => handleAction(button.action)}
            className={`grid h-14 place-items-center rounded-2xl text-xl font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-90 active:translate-y-0 ${button.className}`}
            aria-label={button.label}
          >
            {button.icon ?? button.label}
          </button>
        ))}
      </div>
      {tagline && (
        <button onClick={handleShare} className="btn-ghost mt-4 w-full">
          <Share2 size={16} /> Share result 😂
        </button>
      )}
    </div>
  );
}

function ResultCard({ result, onAgain, onToast }: { result: Result; onAgain: () => void; onToast: (message: string) => void }) {
  const [sharing, setSharing] = useState(false);
  const share = async () => { setSharing(true); try { const method = await shareResult(result); onToast(method === 'shared' ? 'Share sheet opened!' : 'Result copied to clipboard!'); } catch { onToast('No worries, your result is still iconic.'); } finally { setSharing(false); } };
  return <section className="mx-auto max-w-2xl animate-pop-in"><div className="card relative overflow-hidden border border-brand-200/50 bg-white/90 p-7 text-center shadow-2xl shadow-brand-500/15 dark:border-brand-400/20 dark:bg-ink-800/80 sm:p-10"><div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-400/15 blur-3xl" /><div className="relative"><span className="text-6xl">{result.emoji}</span><p className="mt-5 text-sm font-bold uppercase tracking-widest text-brand-500">{result.title}</p><h2 className="mx-auto mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">{result.value}</h2><p className="mx-auto mt-5 max-w-lg text-lg font-medium leading-8 text-ink-600 dark:text-ink-300">{result.reaction}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={onAgain} className="btn-ghost"><RotateCcw size={16} /> Calculate again</button><button onClick={share} className="btn-primary" disabled={sharing}>{sharing ? <Check size={16} /> : <Share2 size={16} />} {sharing ? 'Sharing...' : 'Share result 😂'}</button></div></div></div></section>;
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('relatable-theme') === 'dark');
  const [active, setActive] = useState<CalculatorId | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [life, setLife] = useState<string | null>(null);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('relatable-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 2500); return () => window.clearTimeout(timer); }, [toast]);
  const ids = useMemo(() => calculatorList.map((calculator) => calculator.id), []);
  const navigate = (section: string) => { document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }); };
  const showRandom = () => { setLife(randomLifeResult(lifeResults)); document.getElementById('random')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  return <div className="app-bg min-h-screen animate-gradient-pan">
    <Navbar dark={dark} onToggleTheme={() => setDark(!dark)} onNavigate={navigate} />
    <main>
      <section id="home" className="relative overflow-hidden px-5 pb-16 pt-20 sm:pb-24 sm:pt-28"><div className="mx-auto max-w-4xl text-center"><div className="mb-7 inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-4 py-2 text-sm font-bold text-brand-600 shadow-sm dark:border-brand-400/20 dark:bg-white/10 dark:text-brand-300"><Sparkles size={15} /> The internet’s most relatable calculator</div><h1 className="animate-fade-up text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">Relatable <span className="text-brand-500">Calculator</span> 😂</h1><p className="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-8 text-ink-600 dark:text-ink-300 sm:text-xl">Because normal calculators are too boring.</p><div className="mt-9 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row"><button onClick={() => navigate('calculators')} className="btn-primary px-7">Find your fate <ArrowRight size={18} /></button><button onClick={showRandom} className="btn-ghost px-7">Calculate my life 😂</button></div></div><div className="pointer-events-none absolute -left-20 top-12 h-56 w-56 animate-float rounded-full bg-brand-300/20 blur-3xl" /><div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 animate-float rounded-full bg-sky-300/20 blur-3xl [animation-delay:1.2s]" /></section>
      <section id="calculators" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 lg:px-8"><div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-brand-500">Pick your struggle</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Calculators for real life.</h2></div><p className="max-w-xs text-sm leading-6 text-ink-500 dark:text-ink-400">No judgment. Just numbers, vibes, and a little emotional damage.</p></div>{result ? <ResultCard result={result} onAgain={() => setResult(null)} onToast={setToast} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ids.map((id) => <CalculatorCard key={id} id={id} onClick={() => setActive(id)} />)}</div>}</section>
      <section id="standard" className="scroll-mt-20 px-5 py-16 lg:px-8"><div className="mx-auto max-w-3xl"><div className="mb-8 text-center"><p className="text-sm font-bold uppercase tracking-widest text-brand-500">Actually does math</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">The boring (but working) calculator.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-500 dark:text-ink-400">Yes, it really calculates. Yes, it will still roast you afterwards.</p></div><StandardCalculator onToast={setToast} /></div></section>
      <section id="random" className="scroll-mt-20 px-5 py-16 lg:px-8"><div className="mx-auto max-w-3xl"><div className="card overflow-hidden border-brand-200/50 bg-ink-900 p-8 text-center text-white shadow-2xl shadow-ink-900/20 sm:p-12 dark:bg-brand-500"><div className="absolute" /><p className="text-sm font-bold uppercase tracking-widest text-brand-300 dark:text-white/75">No input. Just vibes.</p><h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Calculate My Life 😂</h2><p className="mx-auto mt-4 max-w-md leading-7 text-ink-300 dark:text-white/80">Press the button and receive a completely random diagnosis of your current existence.</p><button onClick={() => setLife(randomLifeResult(lifeResults))} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-ink-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl active:scale-95">{life ? 'Again, I can take it' : 'Calculate my life'} <Sparkles size={17} /></button>{life && <div className="mx-auto mt-8 max-w-xl animate-pop-in rounded-3xl bg-white/10 p-6 text-xl font-bold leading-8 ring-1 ring-white/20">{life}</div>}</div></div></section>
      <section id="about" className="scroll-mt-20 px-5 pb-24 pt-12 lg:px-8"><div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1fr_1.5fr]"><div><p className="text-sm font-bold uppercase tracking-widest text-brand-500">The fine print</p><h2 className="mt-2 text-3xl font-extrabold">Built for the chronically relatable.</h2></div><div className="card flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-400/10"><Info size={20} /></div><p className="text-sm leading-7 text-ink-600 dark:text-ink-300">Relatable Calculator turns everyday student problems into funny calculations. Results are meant for entertainment and should not be treated as professional, scientific, medical, or financial advice. But if you need an excuse to share your screen time with the group chat, we have you covered.</p></div></div></section>
    </main>
    <footer className="border-t border-ink-200/60 px-5 py-7 dark:border-white/10"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs font-semibold text-ink-400 sm:flex-row sm:text-left"><p>Made with questionable math and good vibes. 😂</p><p>Relatable Calculator · 2024</p></div></footer>
    {active && <CalculatorModal id={active} onClose={() => setActive(null)} onResult={(newResult) => { setResult(newResult); setActive(null); document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />}
    {toast && <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-bold text-white shadow-2xl dark:bg-white dark:text-ink-900"><Copy size={15} /> {toast}</div>}
  </div>;
}

export default App;
