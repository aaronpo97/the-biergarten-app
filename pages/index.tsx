import { PrismaClient } from "@prisma/client";
import type { BeerPost } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";

export const getServerSideProps: GetServerSideProps<{}> = async () => {
   const prisma = new PrismaClient();
   const beerPosts = await prisma.beerPost.findMany();

   return {
      props: {
         beerPosts,
      },
   };
};

interface HomePageProps {
   beerPosts: BeerPost[];
}
const Home: NextPage<HomePageProps> = ({ beerPosts }) => {
   console.log(beerPosts);
   return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
};

export default Home;
