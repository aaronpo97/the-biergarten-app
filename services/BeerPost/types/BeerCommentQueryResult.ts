interface BeerCommentQueryResult {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  postedBy: {
    id: string;
    createdAt: Date;
    username: string;
  };
}

export default BeerCommentQueryResult;
