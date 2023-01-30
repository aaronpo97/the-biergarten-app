import { z } from 'zod';
import BeerCommentValidationSchema from '../validation/CreateBeerCommentValidationSchema';

const sendCreateBeerCommentRequest = async ({
  beerPostId,
  content,
  rating,
}: z.infer<typeof BeerCommentValidationSchema>) => {
  const response = await fetch(`/api/beers/${beerPostId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      beerPostId,
      content,
      rating,
    }),
  });

  const data = await response.json();

  console.log(data);
};

export default sendCreateBeerCommentRequest;
