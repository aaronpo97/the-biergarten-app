import { useEffect } from 'react';
import { showErrorToast } from '../../../components/ui/toast/toast';

export const useActionErrorToast = (error: string | undefined | null) => {
    useEffect(() => {
        if (error) showErrorToast(error);
    }, [error]);
};
