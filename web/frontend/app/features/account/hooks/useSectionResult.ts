import { useEffect } from 'react';
import { showErrorToast } from '../../../components/ui/toast/toast';
import type { ActionResult } from '../types';

type ResultFor<Intent extends ActionResult['intent']> = Extract<
   ActionResult,
   { intent: Intent; success: true }
>;

export const useSectionResult = <Intent extends ActionResult['intent']>(
   result: ActionResult | undefined,
   intent: Intent,
   onSuccess: (result: ResultFor<Intent>) => void,
) => {
   useEffect(() => {
      if (!result || result.intent !== intent) return;
      if (!result.success) {
         showErrorToast(result.error);
         return;
      }
      // TS can't narrow a discriminated union from a generic `intent` parameter,
      // but the checks above already guarantee this shape at runtime.
      onSuccess(result as ResultFor<Intent>);
   }, [result, intent, onSuccess]);
};
