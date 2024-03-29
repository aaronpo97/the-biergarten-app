import UserContext from '@/contexts/UserContext';
import { AccountPageState, AccountPageAction } from '@/reducers/accountPageReducer';

import { Switch } from '@headlessui/react';
import { useRouter } from 'next/router';
import { Dispatch, FunctionComponent, useContext, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface DeleteAccountProps {
  pageState: AccountPageState;
  dispatch: Dispatch<AccountPageAction>;
}
const DeleteAccount: FunctionComponent<DeleteAccountProps> = ({
  dispatch,
  pageState,
}) => {
  const deleteRef = useRef<null | HTMLDialogElement>(null);
  const router = useRouter();
  const { user, mutate } = useContext(UserContext);

  const onDeleteSubmit = async () => {
    deleteRef.current!.close();
    const loadingToast = toast.loading(
      'Deleting your account. We are sad to see you go. 😭',
    );
    const request = await fetch(`/api/users/${user?.id}`, {
      method: 'DELETE',
    });

    if (!request.ok) {
      throw new Error('Could not delete that user.');
    }

    toast.remove(loadingToast);
    toast.success('Deleted your account. Goodbye. 😓');
    await mutate!();
    router.push('/');
  };

  return (
    <div className="card w-full space-y-4">
      <div className="card-body">
        <div className="flex w-full items-center justify-between space-x-5">
          <div className="">
            <h1 className="text-lg font-bold">Delete Your Account</h1>
            <p>Want to leave? Delete your account here.</p>
          </div>
          <div>
            <Switch
              className="toggle"
              id="edit-toggle"
              checked={pageState.deleteAccountOpen}
              onClick={() => {
                dispatch({ type: 'TOGGLE_DELETE_ACCOUNT_VISIBILITY' });
              }}
            />
          </div>
        </div>
        {pageState.deleteAccountOpen && (
          <>
            <div className="mt-3">
              <button
                className="btn btn-primary w-full"
                onClick={() => deleteRef.current!.showModal()}
              >
                Delete my account
              </button>
              <dialog id="delete-modal" className="modal" ref={deleteRef}>
                <div className="modal-box text-center">
                  <h3 className="text-lg font-bold">{`You're about to delete your account.`}</h3>
                  <p className="">This action is permanent and cannot be reversed.</p>
                  <div className="modal-action flex-col space-x-0 space-y-3">
                    <button
                      className="btn btn-error btn-sm w-full"
                      onClick={onDeleteSubmit}
                    >
                      Okay, delete my account
                    </button>
                    <button
                      className="btn btn-success btn-sm w-full"
                      onClick={() => deleteRef.current!.close()}
                    >
                      Go back
                    </button>
                  </div>
                </div>
              </dialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccount;
