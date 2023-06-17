import { Form, Formik } from 'formik';
import { getApiUrl, getUrl } from '../../../server/lib/sharedUtils.js';
import { IUser, IUserLoginCreds } from '../../../server/lib/types.js';
import Layout from '../../common/Layout.jsx';
import {
  ErrorMessage,
  Field,
  Link,
  SubmitBtn,
  WithApiErrors,
  useContext,
  useNavigate,
  useSetGlobalState,
  useSubmit,
} from '../../lib/utils.js';

const NewSessionRaw = () => {
  const { axios } = useContext();
  const setGlobalState = useSetGlobalState();
  const navigate = useNavigate();

  const onSubmit = useSubmit(async (userCreds: IUserLoginCreds) => {
    const user: IUser = await axios.post(getApiUrl('session'), userCreds);
    setGlobalState({ currentUser: user });
    navigate(getUrl('home'));
  });

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <Formik initialValues={{ name: '', password: '' }} onSubmit={onSubmit}>
            <Form>
              <div className="mb-4">
                <label className="text-sm">Login</label>
                <Field className="input" name="name" />
                <ErrorMessage name="name" />
              </div>
              <div className="mb-4">
                <label className="text-sm">Password</label>
                <Field className="input" name="password" type="password" />
                <ErrorMessage name="password" />
              </div>

              <div>
                <Link href={getUrl('home')} className="mr-3">
                  Cancel
                </Link>
                <SubmitBtn className="btn btn_primary">Sign in</SubmitBtn>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </Layout>
  );
};

export const NewSession = WithApiErrors(NewSessionRaw);
