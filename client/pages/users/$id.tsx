import useSWR from 'swr';
import invariant from 'tiny-invariant';
import { useRoute } from 'wouter';
import { getApiUrl, getUrl, routes } from '../../../server/lib/sharedUtils.js';
import { IUser } from '../../../server/lib/types.js';
import Layout from '../../common/Layout.jsx';
import { Link } from '../../lib/utils.jsx';

export const User = () => {
  const [_, params] = useRoute(routes.user);
  invariant(params);

  const { id } = params;
  const { data: user } = useSWR<IUser>(getApiUrl('user', { id }));

  return (
    <Layout>
      <div className="mb-3 flex items-center">
        <div>userId: {id}</div>
        <Link href={getUrl('users')} className="btn btn_sm ml-3" shouldOverrideClass>
          Back
        </Link>
      </div>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  );
};
