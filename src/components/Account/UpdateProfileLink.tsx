import Link from 'next/link';
import React from 'react';

import { FaArrowRight } from 'react-icons/fa';

const UpdateProfileLink: React.FC = () => {
  return (
    <div className="card mt-8">
      <div className="card-body flex flex-col space-y-3">
        <div className="flex w-full items-center justify-between space-x-5">
          <div className="">
            <h1 className="text-lg font-bold">Update Your Profile</h1>
            <p className="text-sm">You can update your profile information here.</p>
          </div>
          <div>
            <Link
              href="/users/account/edit-profile"
              className="btn-sk btn btn-circle btn-ghost btn-sm"
            >
              <FaArrowRight className="text-xl" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileLink;
