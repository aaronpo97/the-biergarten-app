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

  beerComments: {
    id: string;
    content: string;
    createdAt: Date;
    postedBy: {
      id: string;
      username: string;
    };
  }[];

  createdAt: Date;
}
