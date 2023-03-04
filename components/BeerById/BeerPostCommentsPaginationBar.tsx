import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import { FC } from 'react';
import Link from 'next/link';

interface BeerCommentsPaginationBarProps {
  commentsPageNum: number;
  commentsPageCount: number;
  beerPost: BeerPostQueryResult;
}

const BeerCommentsPaginationBar: FC<BeerCommentsPaginationBarProps> = ({
  commentsPageNum,
  commentsPageCount,
  beerPost,
}) => (
  <div className="flex items-center justify-center" id="comments-pagination">
    <div className="btn-group grid w-6/12 grid-cols-2">
      <Link
        className={`btn-outline btn ${
          commentsPageNum === 1
            ? 'btn-disabled pointer-events-none'
            : 'pointer-events-auto'
        }`}
        href={{
          pathname: `/beers/${beerPost.id}`,
          query: { comments_page: commentsPageNum - 1 },
        }}
        scroll={false}
      >
        Next Comments
      </Link>
      <Link
        className={`btn-outline btn ${
          commentsPageNum === commentsPageCount
            ? 'btn-disabled pointer-events-none'
            : 'pointer-events-auto'
        }`}
        href={{
          pathname: `/beers/${beerPost.id}`,
          query: { comments_page: commentsPageNum + 1 },
        }}
        scroll={false}
      >
        Previous Comments
      </Link>
    </div>
  </div>
);

export default BeerCommentsPaginationBar;
