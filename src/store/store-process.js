

const state = {
   selectedPartCurId: {},
   selPartMfgProfObj:{},
   selectedPartMfgLocation: {

      label: "India",
      value: 1,
      description: "India",
      image: "https://www.xe.com/themes/xe/images/flags/svg/inr.svg"

  },

	materialLibrary:[],
   optionsProc: "",
   selectedprocId: {},
   selectedBomPartId:null,

   selectedProjectCurrencyId: null,


   ProcPrimAttri: {

      partData: {


      },
      procPrimVarData: {}
   },
   ProcadvAttri: [],
   ProChartData: {},


   ProcMatList: [],

   selectedProcMatId: null,

   optionsCur: [
      {
        label: "INR",
        value: 1,
        description: "Indian Rupee",
        image: "https://www.xe.com/themes/xe/images/flags/svg/inr.svg",
        symbol:'₹'
      },
      // {
      //   label: "BRL",
      //   value: 6,
      //   description: "Brazilian Real",
      //   image: "https://www.xe.com/themes/xe/images/flags/svg/brl.svg",
      //   symbol:'R$'
      // },
      {
        label: "EUR",
        value: 2,
        description: "Euro",
        image: "https://www.xe.com/themes/xe/images/flags/svg/eur.svg",
        symbol:'€'

      },
      {
        label: "JPY",
        value: 3,
        description: "Japanese Yen",
        image: "https://www.xe.com/themes/xe/images/flags/svg/jpy.svg",
        symbol:'¥'
      },
      {
        label: "USD",
        value: 4,
        description: "US Dollar",
        image: "https://www.xe.com/themes/xe/images/flags/svg/usd.svg",
        symbol:'$'
      },
      {
        label: "CNY",
        value: 5,
        description: "Chinese Yuan Renminbi",
        image: "https://www.xe.com/themes/xe/images/flags/svg/cny.svg",
        symbol:'¥'
      }
    ],

   raceProcessData: [
      {
         label: "Sand Casting",
         value: 1,
         image: "../statics/sandCasting.jpg",
         disable: false
      },

      {
         label: "Injection Moulding",
         value: 2,
         image: "../statics/injectionMolding.jpg",
         disable: false

      },
      // {
      //    label: "AutoGlass",
      //    value: 3,
      //    image: "./statics/autoglass.jpg",
      //    disable: false
      // },
      {
         label: "Forging",
         value: 4,
         image: "../statics/forging.jpg",
         disable: false
      },      
      // {
      //    label: "Stamping",
      //    value: 5,
      //    image: "./statics/stamping.jpg",
      //    disable: false
      // },
      // {
      //    label: "Plasma Cutting",
      //    value: 6,
      //    image: "./statics/plasmaCutting.jpg"
      // },

      // {
      //    label: "Laser Cutting",
      //    value: 7,
      //    image: "./statics/laserCutting.jpg"
      // },
      {
         label: "HPDC",
         value: 9,
         image: "../statics/HPDC.jpg"
      },
      // {
      //    label: "LPDC",
      //    value: 10,
      //    image: "./statics/LPDC.png"
      // },
      // {
      //    label: "Sintering",
      //    value: 8,
      //    image: "./statics/sintering.jpg"
      // },
      // {
      //    label: "Forging Shaft",
      //    value: 12,
      //    image: "./statics/forgingshaft.jpg"
      // },

      // {
      //    label: "Forging Ring",
      //    value: 11,
      //    image: "./statics/forgingring.jpg"
      // },
      // {
      //    label: "Hobbing",
      //    value: 13,
      //    image: "./statics/hobbing.jpg"
      // }
      {
         label: "Stamping_Tandem",
         value: 19,
         image: "../statics/stamping.jpg",
         disable: false
      },
      {
         label: "Stamping_Progressive",
         value: 20,
         image: "../statics/stamping.jpg",
         disable: false
      }

   ],
}

const mutations = {

   //methods to manupulate the data sync
   setProcPrimv(state, payload) {
      state.ProcPrimAttri = payload;

   },

   UpdateSelectedPartCurId(state, payload) {
      state.selectedPartCurId = payload;
      // Object.assign(state.selectedProfile, payload.updates)
  },
  UpdateSelPartMfgProfObj(state, payload) {
   state.selPartMfgProfObj = payload;
   // Object.assign(state.selectedProfile, payload.updates)
},

  UpdateSelctedPartMfgLocation(state, payload) {
   state.selectedPartMfgLocation = payload;
   // Object.assign(state.selectedProfile, payload.updates)
},
   SETASSEMBLYNAME(state, payload) {
      state.textAssemblyName = payload;

   },

   SetSelProcMatId(state, payload) {
      state.selectedProcMatId = payload;
   },

   UpdatePrimaryPartData(state, payload) {
      state.ProcPrimAttri.partData = payload;

   },

   UpdatePrimaryProcVar(state, payload) {
      state.ProcPrimAttri.procPrimVarData = payload;

   },

   UpdateAdvProcVar(state, payload) {

      state.ProcadvAttri = payload;

   },

   UpdateProChartData(state, payload) {

      state.ProChartData = payload;

   },

   UpdatedSelectedProcId(state, payload) {
      state.selectedprocId = payload;

   },

   UpdatedSelectedBOMPartId(state, payload) {
      state.selectedBomPartId = payload;

   },
   UpdatedmaterialLibrary(state, payload) {
      state.materialLibrary = payload;

   }



}

const actions = {

   //async server

   // getProcPrimV({ commit }) {
   //    //call Api

   //    commit('setProcPrimv', response)
   // },

   // setAssemblyName({ commit, payload }) {
   //    //call Api

   //    commit('SETASSEMBLYNAME', payload)
   // },

   // setSelProcProcMatId({ commit, payload }) {
   //    //call Api

   //    commit('SetMatId', payload)
   // },
   updateSelctedPartCurrency(context, payload) {

      context.commit('UpdateSelectedPartCurId', payload)
  },
  updateSelPartMfgProfObj(context, payload) {

   context.commit('UpdateSelPartMfgProfObj', payload)
},

  updateSelctedPartMfgLocation(context, payload) {

   context.commit('UpdateSelctedPartMfgLocation', payload)
},

   updatePrimaryPartData(context, payload) {
      //call Api
      console.log("store action called", payload)
      context.commit('UpdatePrimaryPartData', payload)

   },
   updatePrimaryProcVar(context, payload) {
      //call Api
      console.log("store action called", payload)
      context.commit('UpdatePrimaryProcVar', payload)

   },
   updateAdvProcVar(context, payload) {
      console.log("store process varaibel action called", payload)
      context.commit('UpdateAdvProcVar', payload)

   },

   updatedSelectedProcId(context, payload) {
      //call Api

      context.commit('UpdatedSelectedProcId', payload)

   },
   updatedAssemblyName(context, payload) {
      //call Api

      context.commit('SETASSEMBLYNAME', payload)

   },

   updatedSelectedBOMPartId(context, payload) {
      //call Api

      context.commit('UpdatedSelectedBOMPartId', payload)

   },

   updateProChartData(context, payload) {
      //call Api

      context.commit('UpdateProChartData', payload)

   },

updatedmaterialLibrary(context, payload) {
      //call Api

      context.commit('UpdatedmaterialLibrary', payload)

   }

}

const getters = {

   selectedPartCurrency: state => {
      return state.selectedPartCurId
  },
  getPartMfgLocation: state => {
   return state.selectedPartMfgLocation
},
   //manupalute and send to components
   getPrimVPartData: state => {
      return state.ProcPrimAttri.partData
   },
   getPrimVProctData: state => {
      return state.ProcPrimAttri.procPrimVarData
   },
   getPrimVData: state => {
      return state.ProcPrimAttri
   },

   getAdvProctData: state => {
      return state.ProcadvAttri
   },

   getSelectedProcId: state => {
      return state.selectedprocId
   },
   getAssemlyName: state => {
      return state.textAssemblyName
   },

   getProcessList: state => {
      return state.raceProcessData
   },


   getCurrencyList: state => {
      return state.optionsCur
   },
   getSelectedBomPartId: state => {
      return state.selectedBomPartId
   },
   getProChartData: state => {
      return state.ProChartData
   },
   getSelProcMatId: state => {
      return state.selectedProcMatId
   },
   getmaterialLibrary: state => {
      return state.materialLibrary
   }









}

export const processStore = {
   namespaced: true,
   state,
   mutations,
   actions,
   getters
}