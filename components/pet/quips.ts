// Speech-bubble phrase banks for the site pet. Kept tiny and lowercase to match
// the doodle's casual, hand-written personality.

export const QUIPS = {
  greet: ["hi!", "what's up?", 'oh, hello', 'hey there', 'psst'],
  pokeMild: ['boop', 'hehe', 'that tickles', 'hi again'],
  pokeAnnoyed: ['okay okay', 'easy!', 'hey—', 'careful'],
  pokeMad: ['stop poking me', 'rude!', 'i have feelings >:(', 'enough!'],
  drag: ['wheee', 'where are we going?', 'put me dooown', 'weee', 'whoosh'],
  dizzy: ['whoaa…', 'head spinny', 'too… much…', 'urp'],
  land: ['oof', 'phew', 'stuck the landing', 'tada'],
  bump: ['ow!', 'oof', 'watch it', 'ouch'],
  perch: ['nice spot up here', 'good view!', "i'll just sit here", 'comfy'],
  idle: [
    'just vibing',
    'anyone there?',
    'try dragging me!',
    'hmm…',
    'la la la',
    'have you tried a hat on me?',
    'this site is nice',
  ],
} as const;

// Context-aware idle chatter keyed by the section id currently in view.
// Falls back to QUIPS.idle when the section isn't recognized.
const SECTION_QUIPS: Record<string, string[]> = {
  about: ['that\'s jack!', 'nice photo huh'],
  profile: ['that\'s jack!', 'nice photo huh'],
  experience: ['he\'s done a lot', 'ooh, fancy jobs'],
  work: ['this project looks cool', 'i helped (i didn\'t)', 'so many repos'],
  projects: ['this project looks cool', 'i helped (i didn\'t)'],
  contact: ['leave a note!', 'sign the guestbook 💛', 'say hi to jack'],
};

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function idleQuipFor(sectionId: string | null): string {
  if (sectionId && SECTION_QUIPS[sectionId]) {
    // Mostly section-specific, occasionally a generic line for variety.
    return Math.random() < 0.7
      ? pick(SECTION_QUIPS[sectionId])
      : pick(QUIPS.idle);
  }
  return pick(QUIPS.idle);
}
