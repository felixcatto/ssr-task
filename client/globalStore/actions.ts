import { isNull } from 'lodash-es';
import { IGetGlobalState, INotification, ISetGlobalState } from '../../server/lib/types.js';

const makeActions = (set: ISetGlobalState, get: IGetGlobalState) => ({
  removeNotification: async id => {
    set(state => {
      const item = state.notifications.find(el => el.id === id);
      if (!item) return;
      item.isHidden = true;
      item.isInverseAnimation = true;
    });

    const { notificationAnimationDuration } = get();
    await new Promise(resolve => setTimeout(resolve, notificationAnimationDuration));
    set(state => ({ notifications: state.notifications.filter(el => el.id !== id) }));
  },

  addNotification: async (newNotification: INotification) => {
    const { autoremoveTimeout, id } = newNotification;
    set(state => ({ notifications: [newNotification].concat(state.notifications) }));

    await new Promise(resolve => setTimeout(resolve, 50));
    set(state => {
      const item = state.notifications.find(el => el.id === newNotification.id);
      if (!item) return;
      item.isHidden = false;
    });

    if (isNull(autoremoveTimeout)) return;
    await new Promise(resolve => setTimeout(resolve, autoremoveTimeout));
    const { notifications, removeNotification } = get();
    const isAlreadyRemoved = !notifications.find(el => el.id === id);
    if (isAlreadyRemoved) return;

    removeNotification(id);
  },
});

export default makeActions;
