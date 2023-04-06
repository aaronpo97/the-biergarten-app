import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { FC } from 'react';

interface PaginationProps {
  pageNum: number;
  pageCount: number;
}

const BeerIndexPaginationBar: FC<PaginationProps> = ({ pageCount, pageNum }) => {
  return (
    <div className="btn-group">
      <Link
        className={`btn ${pageNum === 1 ? 'btn-disabled' : ''}`}
        href={{ pathname: '/beers', query: { page_num: pageNum - 1 } }}
        scroll={false}
      >
        <FaArrowLeft />
      </Link>
      <button className="btn">Page {pageNum}</button>
      <Link
        className={`btn ${pageNum === pageCount ? 'btn-disabled' : ''}`}
        href={{ pathname: '/beers', query: { page_num: pageNum + 1 } }}
        scroll={false}
      >
        <FaArrowRight />
      </Link>
    </div>
  );
};

export default BeerIndexPaginationBar;
