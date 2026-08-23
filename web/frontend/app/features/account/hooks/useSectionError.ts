import { useEffect } from 'react';
import { showErrorToast } from '../../../components/ui/toast/toast';
import type { ActionResult } from '../types';

export const useSectionError = (result: ActionResult | undefined, intent: ActionResult['intent']) => {
    useEffect(() => {
        if (!result || result.intent !== intent) return;
        showErrorToast(result.error);
    }, [result, intent]);
};
