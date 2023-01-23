export default interface BeerPostQueryResult {
  id: string;
  name: string;
  brewery: {
    id: string;
    name: string;
  };
  description: string;
  postedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
