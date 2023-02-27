import RegisterUserForm from '@/components/RegisterUserForm';
import FormPageLayout from '@/components/ui/forms/BeerPostFormPageLayout';
import Layout from '@/components/ui/Layout';
import redirectIfLoggedIn from '@/getServerSideProps/redirectIfLoggedIn';
import { NextPage } from 'next';
import Head from 'next/head';
import { BiUser } from 'react-icons/bi';

const RegisterUserPage: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Register User</title>
        <meta name="description" content="Register a new user" />
      </Head>
      <FormPageLayout headingText="Register User" headingIcon={BiUser}>
        <RegisterUserForm />
      </FormPageLayout>
    </Layout>
  );
};

export default RegisterUserPage;

export const getServerSideProps = redirectIfLoggedIn({
  destination: '/',
  permanent: false,
});
