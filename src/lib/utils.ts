import type { Result } from './calculators';

export const shareResult = async (result: Result): Promise<'shared' | 'copied'> => {
  const text = `I just calculated my life with Relatable Calculator 😂\n${result.title}: ${result.value}\n${result.reaction}`;
  return shareText(text);
};

export const shareText = async (text: string, title = 'Relatable Calculator 😂'): Promise<'shared' | 'copied'> => {
  if (navigator.share) {
    await navigator.share({ title, text });
    return 'shared';
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
};

export const randomLifeResult = (results: string[]) => results[Math.floor(Math.random() * results.length)];
