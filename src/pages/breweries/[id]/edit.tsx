import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';
import FormSegment from '@/components/ui/forms/FormSegment';
import FormTextArea from '@/components/ui/forms/FormTextArea';
import FormTextInput from '@/components/ui/forms/FormTextInput';
import getBreweryPostById from '@/services/posts/brewery-post/getBreweryPostById';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import EditBreweryPostValidationSchema from '@/services/posts/brewery-post/schema/EditBreweryPostValidationSchema';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import { zodResolver } from '@hookform/resolvers/zod';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { BiBeer } from 'react-icons/bi';
import { z } from 'zod';

interface EditPageProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

const EditBreweryPostPage: NextPage<EditPageProps> = ({ breweryPost }) => {
  const pageTitle = `Edit \u201c${breweryPost.name}\u201d`;

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof EditBreweryPostValidationSchema>>({
    resolver: zodResolver(EditBreweryPostValidationSchema),
    defaultValues: {
      name: breweryPost.name,
      description: breweryPost.description,
      id: breweryPost.id,
      dateEstablished: breweryPost.dateEstablished,
    },
  });

  const onSubmit = async (data: z.infer<typeof EditBreweryPostValidationSchema>) => {
    const response = await fetch(`/api/breweries/${breweryPost.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    router.push(`/breweries/${breweryPost.id}`);
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/breweries/${breweryPost.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }

    router.push('/breweries');
  };

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
        <>
          <form className="form-control space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <FormInfo>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormError>{errors.name?.message}</FormError>
              </FormInfo>
              <FormSegment>
                <FormTextInput
                  id="name"
                  type="text"
                  placeholder="Name"
                  formValidationSchema={register('name')}
                  error={!!errors.name}
                  disabled={isSubmitting}
                />
              </FormSegment>

              <FormInfo>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormError>{errors.description?.message}</FormError>
              </FormInfo>
              <FormSegment>
                <FormTextArea
                  disabled={isSubmitting}
                  placeholder="Ratione cumque quas quia aut impedit ea culpa facere. Ut in sit et quas reiciendis itaque."
                  error={!!errors.description}
                  formValidationSchema={register('description')}
                  id="description"
                  rows={8}
                />
              </FormSegment>
            </div>

            <div className="w-full space-y-3">
              <button
                disabled={isSubmitting}
                className="btn btn-primary w-full"
                type="submit"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>

              <button
                className="btn btn-primary w-full"
                type="button"
                onClick={handleDelete}
              >
                Delete Brewery
              </button>
            </div>
          </form>
        </>
      </FormPageLayout>
    </>
  );
};

export default EditBreweryPostPage;

export const getServerSideProps = withPageAuthRequired<EditPageProps>(
  async (context, session) => {
    const breweryPostId = context.params?.id as string;
    const breweryPost = await getBreweryPostById(breweryPostId);

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
