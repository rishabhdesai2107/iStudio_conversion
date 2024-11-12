import store from '@/store/store-for-permission';

export default {
  inserted(el, binding, vnode) {
    const { value } = binding;
    const permissions = store.getters && store.getters.permissions;

    if (value && value instanceof Array && value.length > 0) {
      const requiredPermissions = value;
      const hasPermission = permissions 
        ? permissions.some(permission => {
            return requiredPermissions.includes(permission);
          })
        : false;

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error(`Permissions are required! Example: v-permission="['manage user','manage permission']"`);
    }
  },
};
