export default interface BreweryPostQueryResult {
  id: string;
  location: string;
  name: string;
  postedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
