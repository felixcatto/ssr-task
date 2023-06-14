import { memoize } from 'proxy-memoize';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { guestUser, isAdmin, isSignedIn } from '../../server/lib/sharedUtils.js';
import { INotification, IStoreSlice, IUseStore, IUser } from '../../server/lib/types.js';
import makeActions from './actions.js';

export const storeSlice = {
  currentUser: guestUser as IUser,

  notificationAnimationDuration: 0,

  notifications: [] as INotification[],
};

export const session = memoize((state: IStoreSlice) => {
  const currentUser = state.currentUser;
  return {
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  };
});

export const useStore: IUseStore = create<any>(
  immer((set, get) => ({
    setGlobalState: set,
    ...makeActions(set, get),
    ...storeSlice,
  }))
);
