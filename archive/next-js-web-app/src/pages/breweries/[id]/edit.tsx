import EditBreweryPostForm from '@/components/EditBreweryPostForm';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';
import { getBreweryPostByIdService } from '@/services/posts/brewery-post';

import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import { NextPage } from 'next';
import Head from 'next/head';
import { BiBeer } from 'react-icons/bi';
import { z } from 'zod';

interface EditPageProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

const EditBreweryPostPage: NextPage<EditPageProps> = ({ breweryPost }) => {
  const pageTitle = `Edit \u201c${breweryPost.name}\u201d`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageTitle} />
      </Head>

      <FormPageLayout
        headingText={pageTitle}
        headingIcon={BiBeer}
        backLink={`/breweries/${breweryPost.id}`}
        backLinkText={`Back to "${breweryPost.name}"`}
      >
        <EditBreweryPostForm breweryPost={breweryPost} />
      </FormPageLayout>
    </>
  );
};

export default EditBreweryPostPage;

export const getServerSideProps = withPageAuthRequired<EditPageProps>(
  async (context, session) => {
    const breweryPostId = context.params?.id as string;
    const breweryPost = await getBreweryPostByIdService({ breweryPostId });

    const { id: userId } = session;

    if (!breweryPost) {
      return { notFound: true };
    }

    const isBreweryPostOwner = breweryPost.postedBy.id === userId;

    return isBreweryPostOwner
      ? { props: { breweryPost: JSON.parse(JSON.stringify(breweryPost)) } }
      : { redirect: { destination: `/breweries/${breweryPostId}`, permanent: false } };
  },
);
