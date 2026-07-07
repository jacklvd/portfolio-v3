// context/entrance-context.tsx
'use client';
import { createContext, useContext } from 'react';

// True once the preloader's book cover starts swinging open. The landing hero
// keys its entrance choreography off this instead of mount time, so the reveal
// happens behind the opening cover rather than while the loader still hides it.
// Undefined default (same pattern as loading-context) so consuming outside the
// provider throws instead of silently reporting "closed".
const EntranceContext = createContext<boolean | undefined>(undefined);

export const EntranceProvider = EntranceContext.Provider;

export function useEntranceOpen() {
	const value = useContext(EntranceContext);
	if (value === undefined) {
		throw new Error('useEntranceOpen must be used within an EntranceProvider');
	}
	return value;
}
