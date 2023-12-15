import { z } from 'zod';
import BeerStyleQueryResult from '../schema/BeerStyleQueryResult';

type BeerStyle = z.infer<typeof BeerStyleQueryResult>;

export type GetBeerStyleById = (args: {
  beerStyleId: string;
}) => Promise<BeerStyle | null>;

export type DeleteBeerStyleById = (args: {
  beerStyleId: string;
}) => Promise<BeerStyle | null>;

export type EditBeerStyleById = (args: {
  beerStyleId: string;
  body: {
    name: string;
    description: string;
    abvRange: [number, number];
    ibuRange: [number, number];
    glasswareId: string;
  };
}) => Promise<BeerStyle | null>;

export type GetAllBeerStyles = (args: { pageNum: number; pageSize: number }) => Promise<{
  beerStyles: BeerStyle[];
  beerStyleCount: number;
}>;

export type CreateBeerStyle = (args: {
  body: {
    name: string;
    description: string;
    abvRange: [number, number];
    ibuRange: [number, number];
  };
  glasswareId: string;
  postedById: string;
}) => Promise<BeerStyle>;
