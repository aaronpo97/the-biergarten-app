import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Trash, WarningTriangle } from 'iconoir-react';
import { useState } from 'react';
import { useNavigation, useSubmit } from 'react-router';
import { useSectionResult } from '../hooks/useSectionResult';
import type { ActionResult } from '../types';

interface DeleteAccountSectionProps {
   userAccountId: string;
   result: ActionResult | undefined;
}

const DeleteAccountSection = ({ userAccountId, result }: DeleteAccountSectionProps) => {
   const navigation = useNavigation();
   const submit = useSubmit();
   const [dialogOpen, setDialogOpen] = useState(false);
   const isSubmitting = navigation.formData?.get('intent') === 'delete';

   useSectionResult(result, 'delete', () => undefined);

   return (
      <>
         <div className="card bg-error/5 border border-error/30 shadow">
            <div className="card-body">
               <div className="flex items-center justify-between gap-5">
                  <div className="flex items-start gap-3">
                     <span className="text-error mt-1">
                        <Trash className="size-5" aria-hidden="true" />
                     </span>
                     <div>
                        <h2 className="card-title text-lg">Delete Account</h2>
                        <p className="text-sm text-base-content/70">
                           Permanently delete your account. This cannot be undone.
                        </p>
                     </div>
                  </div>
                  <button
                     type="button"
                     className="btn btn-error btn-outline btn-sm"
                     onClick={() => setDialogOpen(true)}
                  >
                     Delete
                  </button>
               </div>
            </div>
         </div>

         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
               <DialogPanel className="card w-full max-w-sm bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center gap-3">
                     <WarningTriangle className="size-10 text-error" aria-hidden="true" />
                     <DialogTitle className="text-lg font-bold">Delete your account?</DialogTitle>
                     <p className="text-sm text-base-content/70">
                        This action is permanent and cannot be reversed. Account ID{' '}
                        <span className="font-mono text-xs">{userAccountId}</span> and all
                        associated data will be removed.
                     </p>
                     <div className="flex flex-col gap-2 w-full pt-2">
                        <button
                           type="button"
                           className="btn btn-error btn-sm w-full"
                           disabled={isSubmitting}
                           onClick={() => submit({ intent: 'delete' }, { method: 'post' })}
                        >
                           {isSubmitting ? (
                              <>
                                 <span className="loading loading-spinner loading-sm" /> Deleting...
                              </>
                           ) : (
                              'Yes, delete my account'
                           )}
                        </button>
                        <button
                           type="button"
                           className="btn btn-ghost btn-sm w-full"
                           onClick={() => setDialogOpen(false)}
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </DialogPanel>
            </div>
         </Dialog>
      </>
   );
};

export default DeleteAccountSection;
