import { FC } from 'react';

const SMLoadingCard: FC = () => {
  return (
    <div className="card bg-base-300">
      <div className="card-body h-52">
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 w-3/4 rounded bg-base-100" />
            <div className="space-y-2">
              <div className="h-4 rounded bg-base-100" />
              <div className="h-4 w-5/6 rounded bg-base-100" />
              <div className="h-4 w-5/6 rounded bg-base-100" />
              <div className="h-4 rounded bg-base-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMLoadingCard;
