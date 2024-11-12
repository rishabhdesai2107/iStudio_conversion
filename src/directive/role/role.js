import store from '@/store/store-for-permission';

export default {
  async inserted(el, binding, vnode) {
    const { value } = binding;
    const roles = store.getters && store.getters.roles;

    if (value && value instanceof Array && value.length > 0) {
      const requiredRoles = value;
      const hasRole = await roles.some(role => {
        return requiredRoles.includes(role);
      });

      if (!hasRole) {
        el.remove()
      }
    } else {
      throw new Error(`Roles are required! Example: v-role="['admin','editor']"`);
    }
  },
};
