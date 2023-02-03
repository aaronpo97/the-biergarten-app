export default interface BeerPostQueryResult {
  id: string;
  name: string;
  brewery: {
    id: string;
    name: string;
  };
  description: string;
  beerImages: {
    url: string;
    id: string;
    alt: string;
  }[];

  ibu: number;
  abv: number;
  type: {
    id: string;
    name: string;
  };
  postedBy: {
    id: string;
    username: string;
  };

  createdAt: Date;
}