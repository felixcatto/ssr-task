import useSWR from 'swr';
import { getUrl } from '../../../server/lib/sharedUtils.js';
import { IUser } from '../../../server/lib/types.js';
import Layout from '../../common/Layout.jsx';
import { Link, useLoaderUrl } from '../../lib/utils.jsx';

type ILoaderData = {
  user: IUser;
};

export const User = () => {
  const loaderUrl = useLoaderUrl();
  const { data } = useSWR<ILoaderData>(loaderUrl);
  const user = data?.user;
  console.log(user);

  return (
    <Layout>
      <div className="mb-3 flex items-center">
        <div>userId: {user?.id}</div>
        <Link href={getUrl('users')} className="btn btn_sm ml-3" shouldOverrideClass>
          Back
        </Link>
      </div>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  );
};
