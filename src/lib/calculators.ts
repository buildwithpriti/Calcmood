export type CalculatorId = 'study' | 'sleep' | 'exam' | 'money' | 'screen' | 'caffeine' | 'procrastination';

export type Result = {
  title: string;
  value: string;
  reaction: string;
  emoji: string;
};

export type Field = {
  name: string;
  label: string;
  type: 'number' | 'time';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
};

export type Calculator = {
  id: CalculatorId;
  emoji: string;
  name: string;
  description: string;
  color: string;
  fields: Field[];
  calculate: (values: Record<string, number | string>) => Result;
};

const number = (name: string, label: string, placeholder: string, min = 0, max?: number, step = 1, prefix?: string): Field => ({ name, label, type: 'number', placeholder, min, max, step, prefix });

const sleepMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const calculators: Calculator[] = [
  {
    id: 'study', emoji: '📚', name: 'Study Calculator', color: 'rose',
    description: 'Find out how fast you can finish your syllabus (in theory).',
    fields: [number('chapters', 'Chapters left', 'e.g. 12', 1, 200), number('days', 'Days left', 'e.g. 5', 1, 365), number('hours', 'Study hours per day', 'e.g. 3', 0.25, 24, 0.25)],
    calculate: (v) => {
      const chapters = Number(v.chapters), days = Number(v.days), hours = Number(v.hours);
      const perDay = chapters / days;
      const possible = hours >= 2 ? `Technically, you can finish ${chapters} chapters in ${days} days.` : `You need about ${Math.ceil(perDay)} chapter${Math.ceil(perDay) === 1 ? '' : 's'} per day.`;
      const reaction = hours >= 4 ? 'Academic weapon mode activated. Now close the memes and begin. 🗿' : hours >= 2 ? 'Realistically… you will start tomorrow. We both know this. 😭' : 'The syllabus is not going to finish itself, bestie. 💀';
      return { title: 'Your study prophecy', value: possible, reaction, emoji: hours >= 4 ? '🗿' : '😭' };
    },
  },
  {
    id: 'sleep', emoji: '😴', name: 'Sleep Calculator', color: 'sky',
    description: 'Measure the gap between your bedtime ambitions and reality.',
    fields: [
      { name: 'wake', label: 'Wake-up time', type: 'time' },
      { name: 'bed', label: 'Planning to sleep at', type: 'time' },
    ],
    calculate: (v) => {
      let diff = sleepMinutes(String(v.wake)) - sleepMinutes(String(v.bed));
      if (diff <= 0) diff += 24 * 60;
      const h = Math.floor(diff / 60), m = diff % 60;
      const duration = `${h} hour${h === 1 ? '' : 's'}${m ? ` ${m} minute${m === 1 ? '' : 's'}` : ''}`;
      const reaction = diff >= 480 ? 'Academic weapon activated. Please enjoy this rare luxury. 🗿' : diff >= 360 ? 'Acceptable. You might even remember why you entered the room tomorrow. 😌' : 'Bro is running on Wi-Fi and hope. 😭';
      return { title: 'Your sleep forecast', value: `${duration} of sleep`, reaction, emoji: diff >= 480 ? '🗿' : diff >= 360 ? '😌' : '😭' };
    },
  },
  {
    id: 'exam', emoji: '📝', name: 'Exam Marks Predictor', color: 'amber',
    description: 'A totally unofficial estimate based on your exam confidence.',
    fields: [number('total', 'Total marks', 'e.g. 100', 1, 1000), number('correct', 'Expected correct answers', 'e.g. 72', 0, 1000), number('wrong', 'Expected wrong answers', 'e.g. 8', 0, 1000)],
    calculate: (v) => {
      const total = Number(v.total), correct = Number(v.correct), wrong = Number(v.wrong);
      const score = Math.max(0, Math.min(total, correct - wrong * 0.25));
      const percent = Math.round((score / total) * 100);
      const reaction = percent >= 80 ? 'Bro accidentally became the topper. Leave some marks for the rest of us. 🗿' : percent >= 50 ? 'Respectable. Mom might still ask about the topper though. 😭' : 'Let’s call it character development. The comeback arc starts now. 💀';
      return { title: 'Your totally unofficial prediction', value: `${Math.round(score)} / ${total} marks (${percent}%)`, reaction, emoji: percent >= 80 ? '🗿' : percent >= 50 ? '😭' : '💀' };
    },
  },
  {
    id: 'money', emoji: '💸', name: 'Pocket Money Calculator', color: 'emerald',
    description: 'Discover how long your money survives outside the group chat.',
    fields: [number('starting', 'Starting money', 'e.g. 1000', 0, 100000, 1, '₹'), number('food', 'Food spending', 'e.g. 350', 0, 100000, 1, '₹'), number('shopping', 'Shopping spending', 'e.g. 200', 0, 100000, 1, '₹'), number('other', 'Other spending', 'e.g. 100', 0, 100000, 1, '₹')],
    calculate: (v) => {
      const left = Number(v.starting) - Number(v.food) - Number(v.shopping) - Number(v.other);
      const reaction = left > 500 ? 'Congratulations. You are financially responsible… until tomorrow. 😂' : left >= 0 ? 'Your wallet is breathing, but it has seen things. 😮‍💨' : 'Your money has entered the shadow realm. Please stop opening food delivery apps. 💀';
      return { title: 'Wallet status', value: `₹${left.toLocaleString('en-IN')} left`, reaction, emoji: left > 500 ? '💰' : left >= 0 ? '😮‍💨' : '💀' };
    },
  },
  {
    id: 'screen', emoji: '📱', name: 'Screen Time Calculator', color: 'violet',
    description: 'Turn daily scrolling into a number you can emotionally process.',
    fields: [number('daily', 'Daily screen time', 'e.g. 6', 0, 24, 0.25, 'hrs'), number('days', 'Number of days', 'e.g. 7', 1, 3650)],
    calculate: (v) => {
      const total = Number(v.daily) * Number(v.days), days = total / 24;
      const approx = days >= 1 ? `${days.toFixed(1)} days` : `${total.toFixed(1)} hours`;
      return { title: 'Your scrolling report', value: `${total.toFixed(1)} hours on your phone`, reaction: `That's approximately ${approx}. Not judging. The algorithm is just very persuasive. 💀`, emoji: total > 48 ? '💀' : '📱' };
    },
  },
  {
    id: 'caffeine', emoji: '☕', name: 'Caffeine / Tea Counter', color: 'orange',
    description: 'Count your cups and receive a completely unserious status update.',
    fields: [number('cups', 'Cups of tea / coffee today', 'e.g. 3', 0, 50)],
    calculate: (v) => {
      const cups = Number(v.cups);
      const reaction = cups === 0 ? 'Hydration arc? Unexpected, but we support it. 💧' : cups === 1 ? 'Normal human behavior. A peaceful cup. ☕' : cups <= 3 ? 'Productivity mode activated. Keyboard noises intensify. ⚡' : cups <= 6 ? 'You are now 70% beverage and 30% unfinished tasks. 😭' : 'Please remember you are still a human and not a startup founder. 💀';
      return { title: 'Beverage-based personality', value: `${cups} cup${cups === 1 ? '' : 's'} logged`, reaction, emoji: cups > 6 ? '💀' : cups > 3 ? '😭' : '☕' };
    },
  },
  {
    id: 'procrastination', emoji: '🎮', name: 'Procrastination Calculator', color: 'indigo',
    description: 'Put a percentage on the time you spent doing literally anything else.',
    fields: [number('planned', 'Hours of work planned', 'e.g. 5', 0.25, 24, 0.25), number('procrastinated', 'Hours spent procrastinating', 'e.g. 4', 0, 24, 0.25)],
    calculate: (v) => {
      const planned = Number(v.planned), wasted = Number(v.procrastinated), total = planned + wasted;
      const pct = total ? Math.round((wasted / total) * 100) : 0;
      return { title: 'Productivity audit', value: `Productivity: ${100 - pct}% · Procrastination: ${pct}%`, reaction: pct >= 70 ? 'Professional procrastinator. The trophy is in the mail. 🏆' : pct >= 40 ? 'A healthy mix of ambition and side quests. Respect. 😭' : 'Look at you, actually doing the thing. Character development! 🗿', emoji: pct >= 70 ? '🏆' : pct >= 40 ? '😭' : '🗿' };
    },
  },
];

export const standardTaglines = [
  'Math is mathing… finally 😂',
  'Your calculator did the work, you just pressed the buttons 😭',
  'Result verified by absolutely nobody 💀',
  'Look at you, doing actual math. We are all proud. 🗿',
  'This number is legally binding in exactly zero countries. 😎',
  'Calculated with 100% confidence and 0% supervision. 😂',
  'The math checks out. The life choices behind it do not. 💀',
  'Big brain energy detected. Please hydrate. 🧠',
  'You pressed equals and still felt something. That is growth. 😭',
  'Result delivered with a side of emotional support. 🫶',
];

export const lifeResults = [
  'Your productivity today: loading… ⏳', 'You have 17 tabs open and no idea why. 💻', 'You planned to study at 7 PM. It’s 11:47 PM. 😭', 'Your motivation has left the chat. 💀', 'You are 90% tired and 10% pretending you’re fine. 😮‍💨', 'Tomorrow is definitely the day. Trust me. 😂', 'You opened your phone to check one thing. That was 45 minutes ago. 📱', 'The deadline is not a deadline until it is emotionally dangerous. 🫡', 'You deserve a snack for surviving absolutely nothing today. 🍪', 'Your brain has 3% battery but 47 new ideas. ⚡',
];

export const calculatorList = calculators;
export const getCalculator = (id: CalculatorId) => calculators.find((calculator) => calculator.id === id)!;
