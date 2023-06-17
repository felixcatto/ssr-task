import useSWR from 'swr';
import { getUrl } from '../../../server/lib/sharedUtils.js';
import { IUser } from '../../../server/lib/types.js';
import Layout from '../../common/Layout.jsx';
import { Link, useLoaderUrl, userRolesToIcons } from '../../lib/utils.js';

type ILoaderData = {
  users: IUser[];
};

export const Users = () => {
  const loaderUrl = useLoaderUrl();
  const { data } = useSWR<ILoaderData>(loaderUrl);
  const users = data?.users || [];
  console.log(users);

  return (
    <Layout>
      <h3 className="mb-4 select-none">List of users</h3>

      <table className="table-fixed mb-5">
        <thead>
          <tr>
            <th className="w-5/12">
              <div>Name</div>
            </th>
            <th className="w-4/12">
              <div>Email</div>
            </th>
            <th className="w-2/12">
              <div>Role</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {users?.map(user => (
            <tr key={user.id}>
              <td>
                <Link href={getUrl('user', { id: user.id })}>{user.name}</Link>
              </td>
              <td>{user.email}</td>
              <td>
                <div className="flex items-center">
                  <div className="w-6">
                    <i className={userRolesToIcons[user.role]}></i>
                  </div>
                  <div>{user.role}</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-sm text-slate-500">* Name of users is clickable</div>
    </Layout>
  );
};
