import cn from 'classnames';
import { getApiUrl, getUrl } from '../../server/lib/sharedUtils.js';
import { session } from '../globalStore/store.js';
import {
  Link,
  NavLink,
  css,
  useContext,
  useSetGlobalState,
  useStore,
  userRolesToIcons,
} from '../lib/utils.js';
import { Notifications } from '../ui/Notifications.jsx';

const Layout = ({ children }: any) => {
  const { axios } = useContext();
  const setGlobalState = useSetGlobalState();
  const { currentUser, isSignedIn } = useStore(session);

  const signOut = async () => {
    const user = await axios.delete(getApiUrl('session'));
    setGlobalState({ currentUser: user });
  };

  return (
    <div className={s.app()}>
      <div className={s.header()}>
        <div className={cn('container relative', s.headerFg())}>
          <div className="flex items-center">
            <img src="/img/tiger3.webp" className={cn('mr-7', s.logo())} />
            <div className="flex">
              <NavLink href={getUrl('home')}>Todolist</NavLink>
              <NavLink href={getUrl('users')}>Users</NavLink>
            </div>
          </div>
          {isSignedIn ? (
            <div className="flex items-center">
              <div className="flex items-center mr-1">
                <i className={cn('text-white mr-1', userRolesToIcons[currentUser.role])}></i>
                <div>{currentUser.name}</div>
              </div>
              <i
                className={cn('fa fa-sign-out-alt', s.signIcon())}
                title="Sign out"
                onClick={signOut}
              ></i>
            </div>
          ) : (
            <Link href={getUrl('newSession')} className={s.signIn()}>
              <div className={s.signInText()}>Sign In</div>
              <i className={cn('fa fa-sign-in-alt', s.signIcon())} title="Sign in"></i>
            </Link>
          )}
        </div>
      </div>
      <div className={cn('container', s.content())}>{children}</div>
      <Notifications />
    </div>
  );
};

const signInText = css({});

const s = {
  app: css({
    h: '100%',
    display: 'grid',
    gridTemplateAreas: `
      'header'
      'content'
    `,
    gridTemplateRows: 'var(--headerHeight) 1fr',
  }),

  header: css({
    gridArea: 'header',
    position: 'relative',
    bg: 'var(--primary)',
    boxShadow: '0 1px 10px 0 rgba(0, 0, 0, 0.5)',
  }),

  headerFg: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: '10px 15px',
    color: 'White',
  }),

  logo: css({
    w: 74,
    h: 50,
    transform: 'scale(1.2)',
  }),

  signIn: css({
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    textDecoration: 'none',

    '&:hover': {
      color: '#fff',
      textDecoration: 'none',
    },

    [`&:hover .${signInText}`]: {
      textDecoration: 'underline',
    },
  }),

  signInText,

  signIcon: css({
    mr: -10,
    p: '4px 10px',
    color: '#fff',
    cursor: 'pointer',
    textDecoration: 'none',
  }),

  content: css({
    gridArea: 'content',
    pt: 'var(--content-py)',
    pb: 'var(--content-py)',
    bg: '#fff',
    boxShadow: 'inset 6px 0 6px rgba(0, 0, 0, 0.2), inset -6px 0 6px rgba(0, 0, 0, 0.2)',
  }),
};

export default Layout;
