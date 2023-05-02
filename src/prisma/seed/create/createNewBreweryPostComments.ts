// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BreweryPost, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBreweryPostCommentsArgs {
  numberOfComments: number;
  joinData: {
    breweryPosts: BreweryPost[];
    users: User[];
  };
}

interface BreweryPostCommentData {
  content: string;
  postedById: string;
  breweryPostId: string;
  rating: number;
  createdAt: Date;
}

const createNewBreweryPostComments = async ({
  numberOfComments,
  joinData,
}: CreateNewBreweryPostCommentsArgs) => {
  const { breweryPosts, users } = joinData;
  const prisma = DBClient.instance;
  const breweryPostCommentData: BreweryPostCommentData[] = [];
  const createdAt = faker.date.past(1);
  const rating = Math.floor(Math.random() * 5) + 1;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfComments; i++) {
    const content = faker.lorem.lines(3).replace(/\n/g, ' ');
    const user = users[Math.floor(Math.random() * users.length)];
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];

    breweryPostCommentData.push({
      content,
      createdAt,
      rating,
      postedById: user.id,
      breweryPostId: breweryPost.id,
    });
  }
  await prisma.breweryComment.createMany({ data: breweryPostCommentData });

  return prisma.breweryComment.findMany();
};

export default createNewBreweryPostComments;
