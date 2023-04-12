// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BreweryComment, BreweryPost, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBreweryPostCommentsArgs {
  numberOfComments: number;
  joinData: {
    breweryPosts: BreweryPost[];
    users: User[];
  };
}

const createNewBreweryPostComments = async ({
  numberOfComments,
  joinData,
}: CreateNewBreweryPostCommentsArgs) => {
  const { breweryPosts, users } = joinData;
  const prisma = DBClient.instance;
  const breweryCommentPromises: Promise<BreweryComment>[] = [];
  const createdAt = faker.date.past(1);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfComments; i++) {
    const content = faker.lorem.lines(5);
    const user = users[Math.floor(Math.random() * users.length)];
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    breweryCommentPromises.push(
      prisma.breweryComment.create({
        data: {
          content,
          postedBy: { connect: { id: user.id } },
          breweryPost: { connect: { id: breweryPost.id } },
          rating: Math.floor(Math.random() * 5) + 1,
          createdAt,
        },
      }),
    );
  }
  return Promise.all(breweryCommentPromises);
};

export default createNewBreweryPostComments;
