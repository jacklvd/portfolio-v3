// context/entrance-context.tsx
'use client';
import { createContext, useContext } from 'react';

// True once the preloader's book cover starts swinging open. The landing hero
// keys its entrance choreography off this instead of mount time, so the reveal
// happens behind the opening cover rather than while the loader still hides it.
const EntranceContext = createContext(false);

export const EntranceProvider = EntranceContext.Provider;

export function useEntranceOpen() {
	return useContext(EntranceContext);
}
