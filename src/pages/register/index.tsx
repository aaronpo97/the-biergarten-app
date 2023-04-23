import RegisterUserForm from '@/components/RegisterUserForm';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';

import useRedirectWhenLoggedIn from '@/hooks/useRedirectIfLoggedIn';
import { NextPage } from 'next';
import Head from 'next/head';
import { BiUser } from 'react-icons/bi';

const RegisterUserPage: NextPage = () => {
  useRedirectWhenLoggedIn();

  return (
    <>
      <Head>
        <title>Register User</title>
        <meta name="description" content="Register a new user" />
      </Head>
      <FormPageLayout
        headingText="Register User"
        headingIcon={BiUser}
        backLink="/"
        backLinkText="Back to home"
      >
        <RegisterUserForm />
      </FormPageLayout>
    </>
  );
};

export default RegisterUserPage;
