import api from '../api/auth-outh'
import qs from 'qs';
import Router from 'vue-router'
import { Cookies } from 'quasar'

const state = {
  token: window.localStorage.getItem('imgur_token'),
  locale: ''
};

const getters = {
  //!! converinto boolen
  isLoggedIn: state => !!state.token
};

const actions = {
  login: () => {
    api.login();
  },
  finalizeLogin({ commit }, hash) {
    //const query = qs.parse(hash.replace('#', ''));

    commit('setToken', 'query.access_token');
    window.localStorage.setItem('imgur_token', 'query.access_token');
    this.$router.push('/dashboard');
  },
  logout: ({ commit }) => {
    commit('setToken', null);
    window.localStorage.removeItem('imgur_token');
   // this.$router.push('/'); WHY NOT WORKING??
  },
  getLocale({ commit }, obj) {
    locale = obj.Cookies.get('locale');
    commit('SET_LOCALE', locale);
  }
};

const mutations = {
  setToken: (state, token) => {
    state.token = token;
  },
  SET_LOCALE: (state, obj) => {
    state.locale = obj.Cookies.get('locale');
  }
};

export const auth = {
  state,
  getters,
  actions,
  mutations
};