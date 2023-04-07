import { FC } from 'react';
import Link from 'next/link';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface BeerCommentsPaginationBarProps {
  commentsPageNum: number;
  commentsPageCount: number;
  beerPost: z.infer<typeof beerPostQueryResult>;
}

const BeerCommentsPaginationBar: FC<BeerCommentsPaginationBarProps> = ({
  commentsPageNum,
  commentsPageCount,
  beerPost,
}) => (
  <div className="flex items-center justify-center" id="comments-pagination">
    <div className="btn-group">
      <Link
        className={`btn-ghost btn ${
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
        <FaArrowLeft />
      </Link>
      <button className="btn-ghost btn pointer-events-none">{commentsPageNum}</button>
      <Link
        className={`btn-ghost btn ${
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
        <FaArrowRight />
      </Link>
    </div>
  </div>
);

export default BeerCommentsPaginationBar;
