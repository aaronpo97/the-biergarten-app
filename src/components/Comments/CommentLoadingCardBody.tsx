const CommentLoadingCardBody = () => {
  return (
    <div className="card-body h-52 fade-in-10">
      <div className="flex animate-pulse space-x-4 slide-in-from-top">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 w-3/4 rounded bg-base-100" />
          <div className="space-y-2">
            <div className="h-4 rounded bg-base-100" />
            <div className="h-4 w-11/12 rounded bg-base-100" />
            <div className="h-4 w-10/12 rounded bg-base-100" />
            <div className="h-4 w-11/12 rounded bg-base-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentLoadingCardBody;
