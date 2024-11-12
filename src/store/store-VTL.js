
const state = {
  sheetdata:[],
  mSavedb: [],
  modelschema: {},
  prodcuts:[],
  chargeCode: [],
  selChargeCode:'',
  currentChargeCode: null,
  reloadNaveBar: true,
  spinner: false,
  activeNavMenu: null,
  user: null,
  tenant: null,
  superAdminChargeCodeList: null
}

const mutations = {
  UpdateMsaveDb(state, payload) {
    state.mSavedb=payload;
  },
  UpdateProducts(state, payload) {
    state.prodcuts=payload;
  },
  UpdateModelSchema(state, payload) {
    state.modelschema = payload;
  },
  UpdateSheetData(state, payload) {
    state.sheetdata = payload;
  },
  updateChargeCodeMutation(state, payload) {
    state.chargeCode = payload;
  },
  UpdateSelChargeCode(state, payload) {
    state.selChargeCode = payload;
  },
  updateCurrentChargeCodeDetails(state, payload) {
    state.currentChargeCode = payload;
  },
  updateReloadNaveBar(state, payload) {
    state.reloadNaveBar = payload;
  },
  toggleSpinner(state, payload) {
    state.spinner = payload 
  },
  setActiveMenu(state, payload) {
    state.activeNavMenu = payload
  },
  setLoginUser(state, payload) {
    state.user = payload
  },
  updateTenant(state, payload) {
    state.tenant = payload
  },
  updateSuperAdminChargeCodeList(state, payload) {
    state.superAdminChargeCodeList = payload
  }
}

const actions = {
  updateMsaveDb(context, payload) {
    context.commit('UpdateMsaveDb', payload)
  },
  updateProducts(context, payload) {
    context.commit('UpdateProducts', payload)
  },
  updateModelSchema(context, payload) {
    context.commit('UpdateModelSchema', payload)
  },
  updateSheetData(context, payload) {
    context.commit('UpdateSheetData', payload)
  },
  updateChargeCodeAction(context, payload) {
    context.commit('updateChargeCodeMutation', payload)
  },
  updateSelChargeCode(context, payload) {
    context.commit('UpdateSelChargeCode', payload)
  },
  updateCurrentChargeCodeDetails(context, payload) {
    context.commit('updateCurrentChargeCodeDetails', payload)
  },
  updateReloadNaveBar(context, payload) {
    context.commit('updateReloadNaveBar', payload)
  }
}

const getters = {
  getSelChargeCode: state => {
    return state.selChargeCode
  },
  getAllProductsAttributes: state => {
    return state.prodcuts.modelAttribute
  },
  getMsaveDb: state => {
    return state.mSavedb
  },
  getProducts: state => {
    return state.prodcuts
  },
  getSheetData: state => {
    return state.sheetdata
  },
  getChargeCode: state => state.chargeCode,
  getCurrentChargeCode: state => state.currentChargeCode,
  getReloadNaveBar: state => state.reloadNaveBar,
  QSpinner: state => state.spinner,
  getActiveNavMenu: state => state.activeNavMenu,
  user: state => state.user,
  selectedTenant: state => state.tenant,
  superAdminChargeCodeList: state => state.superAdminChargeCodeList
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
