'use server';

import { getSessionUserId } from '@/lib/session';
import { saveCalculationCore, type SaveState } from '@/lib/save-calculation';
import { loadCalcSettings } from '@/lib/settings';

/** Recomputes the submitted calculation on the server and saves it to the customer's profile. */
export async function saveCalculation(_prev: SaveState, form: FormData): Promise<SaveState> {
  return saveCalculationCore(form, {
    settings: await loadCalcSettings(),
    userId: await getSessionUserId(),
    store: null,
    now: new Date(),
  });
}
