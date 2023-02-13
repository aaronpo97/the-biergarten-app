import Layout from '@/components/ui/Layout';
import { NextPage } from 'next';

interface AccountPageProps {}

const AccountPage: NextPage<AccountPageProps> = () => {
  return (
    <Layout>
      <div>
        <h1>Account Page</h1>
      </div>
    </Layout>
  );
};

export default AccountPage;
