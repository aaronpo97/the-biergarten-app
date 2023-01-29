import { useRouter } from 'next/router';
import { FC } from 'react';

interface PaginationProps {
  pageNum: number;
  pageCount: number;
}

const Pagination: FC<PaginationProps> = ({ pageCount, pageNum }) => {
  const router = useRouter();

  return (
    <div className="btn-group">
      <button
        className="btn"
        disabled={pageNum <= 1}
        onClick={async () =>
          router.push({ pathname: '/beers', query: { page_num: pageNum - 1 } })
        }
      >
        «
      </button>
      <button className="btn">Page {pageNum}</button>
      <button
        className="btn"
        disabled={pageNum >= pageCount}
        onClick={async () =>
          router.push({ pathname: '/beers', query: { page_num: pageNum + 1 } })
        }
      >
        »
      </button>
    </div>
  );
};

export default Pagination;
