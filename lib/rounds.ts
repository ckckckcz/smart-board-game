import type { Round } from '@/types/game';

export function sortRoundsForDisplay(rounds: Round[]): Round[] {
  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

  const getSortKey = (nameRaw: string, originalIndex: number) => {
    const name = normalize(nameRaw);

    // Keep other rounds first (DB order), but place these "special" rounds at the end.
    if (name.includes('babak awal')) return { group: 2, order: 1, fallback: originalIndex };
    if (name.includes('babak middle') || name.includes('babak tengah')) return { group: 2, order: 2, fallback: originalIndex };
    if (name.includes('babak akhir')) return { group: 2, order: 3, fallback: originalIndex };

    const tahapMatch = name.match(/\btahap\s*(\d+)\b/);
    if (tahapMatch) return { group: 2, order: 100 + (Number(tahapMatch[1]) || 0), fallback: originalIndex };

    return { group: 1, order: 0, fallback: originalIndex };
  };

  return rounds
    .map((round, idx) => ({ round, idx, key: getSortKey(round.name, idx) }))
    .sort((a, b) => {
      if (a.key.group !== b.key.group) return a.key.group - b.key.group;
      if (a.key.order !== b.key.order) return a.key.order - b.key.order;
      return a.key.fallback - b.key.fallback;
    })
    .map(({ round }) => round);
}
