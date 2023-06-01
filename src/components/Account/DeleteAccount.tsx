import { Switch } from '@headlessui/react';
import { useRouter } from 'next/router';
import { FunctionComponent, useRef, useState } from 'react';

const DeleteAccount: FunctionComponent = () => {
  const [deleteToggled, setDeleteToggled] = useState(false);

  const deleteRef = useRef<null | HTMLDialogElement>(null);
  const router = useRouter();

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
              checked={deleteToggled}
              onClick={() => {
                setDeleteToggled((val) => !val);
              }}
            />
          </div>
        </div>
        {deleteToggled && (
          <>
            <div className="mt-3">
              <button
                className="btn-primary btn w-full"
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
                      className="btn-error btn-sm btn w-full"
                      onClick={async () => {
                        deleteRef.current!.close();
                        await router.replace('/api/users/logout');
                      }}
                    >
                      Okay, delete my account
                    </button>
                    <button
                      className="btn-success btn-sm btn w-full"
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
