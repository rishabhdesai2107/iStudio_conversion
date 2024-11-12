
const state = {

    selectedProjCurId: {
        label: "INR",
        value: 1,
        description: "Indian Rupee",
        image: "https://www.xe.com/themes/xe/images/flags/svg/inr.svg"
    }

    ,
    selectedProjMfgLocationId: {

        label: "India",
        value: 1,
        description: "Indian",
        image: "https://www.xe.com/themes/xe/images/flags/svg/inr.svg"

    },
    selRowId: null,
    project: {

        ObjProject: {},
        assembly: {
            name: '',
            number: '',
            id: null
        },
        bom: {

            rowData: [
                {
                    id: "",
                    name: "",
                    image: "../statics/gear-metal-wheels.jpg",
                    quantity: 1,
                    type: "RM",
                    weight: 1,
                    material: {

                        label: 'Select Material',
                        value: ''

                    },
                    process: [{
                        label: {
                            value: null,
                            image: "./statics/blankprocess.png",
                            disable: false,
                            label: "Select Process",
                        },
                    }

                    ],
                    total: [0, 11],
                    partRaceTotalCost: 0
                },

            ]


        },


    },
    mfgLocationList: [
        {
            label: "India",
            value: 1,
            description: "India",
            image: "https://www.xe.com/themes/xe/images/flags/svg/inr.svg"
        },
        // {
        //     label: "Brazil",
        //     value: 6,
        //     description: "Brazil",
        //     image: "https://www.xe.com/themes/xe/images/flags/svg/brl.svg"
        // },
        {
            label: "Europe",
            value: 2,
            description: "Europe",
            image: "https://www.xe.com/themes/xe/images/flags/svg/eur.svg"
        },
        {
            label: "Japan",
            value: 3,
            description: "Japan",
            image: "https://www.xe.com/themes/xe/images/flags/svg/jpy.svg"
        },
        {
            label: "USA",
            value: 4,
            description: "USA",
            image: "https://www.xe.com/themes/xe/images/flags/svg/usd.svg"
        },
        {
            label: "China",
            value: 5,
            description: "China",
            image: "https://www.xe.com/themes/xe/images/flags/svg/cny.svg"
        },
        {
            label: "Thailand",
            value: 8,
            description: "Thailand",
            image: "https://www.xe.com/themes/xe/images/flags/svg/thb.svg"
        },
        {
            label: "South Korean",
            value: 21,
            description: "South Korean",
            image: "https://www.xe.com/themes/xe/images/flags/svg/krw.svg"
        }

    ],

      projCurrencyList: [
        {
          label: "INR",
          value: 1,
          description: "Indian Rupee",
          image: "https://www.xe.com/themes/xe/images/flags/svg/inr.svg",
          symbol: '₹',
          agg: 'Cr.',          
          curUSDConv: 70
        },
        {
          label: "BRL",
          value: 6,
          description: "Brazilian Real",
          image: "https://www.xe.com/themes/xe/images/flags/svg/brl.svg",
          symbol:'R$',
          agg:'Million',
          curUSDConv: 4.21
        },
        {
          label: "EUR",
          value: 2,
          description: "Euro",
          image: "https://www.xe.com/themes/xe/images/flags/svg/eur.svg",
          symbol: '€',
          agg: 'Million',
          curUSDConv:0.9
  
        },
        {
          label: "JPY",
          value: 3,
          description: "Japanese Yen",
          image: "https://www.xe.com/themes/xe/images/flags/svg/jpy.svg",
          symbol:'¥',
          agg:'Million',
          curUSDConv: 108.56
        },
        {
          label: "USD",
          value: 4,
          description: "US Dollar",
          image: "https://www.xe.com/themes/xe/images/flags/svg/usd.svg",
          symbol: '$',
          agg: 'Million',
          curUSDConv:1
        },
        {
          label: "CNY",
          value: 5,
          description: "Chinese Yuan Renminbi",
          image: "https://www.xe.com/themes/xe/images/flags/svg/cny.svg",
          symbol: '¥',
          agg: 'Million',
          curUSDConv: 7.01
        },
        {
            label: "THB",
            value: 8,
            description: "Thai Baht",
            image: "https://www.xe.com/themes/xe/images/flags/svg/thb.svg",
            symbol: 'THB',
            curUSDConv: 30.27,
            agg: 'Million',
        },
        {
            label: "KRW",
            value: 21,
            description: "South Korean Won",
            image: "https://www.xe.com/themes/xe/images/flags/svg/krw.svg",
            symbol: 'KRW',
            curUSDConv: 0.000873050,
            agg: 'Million',
        }
      ],




}


















const mutations = {

    //methods to manupulate the data sync
    UpdateSelectedProjCurId(state, payload) {
        state.selectedProjCurId = payload;
        // Object.assign(state.selectedProfile, payload.updates)
    },
    UpdateSelectedProjMfgLocationId(state, payload) {
        state.selectedProjMfgLocationId = payload;
        // Object.assign(state.selectedProfile, payload.updates)
    },
    UpdateSelectedObjProj(state, payload) {
        state.project.ObjProject = payload;
        // Object.assign(state.selectedProfile, payload.updates)
    },
    //update selected project mfgid
    UpdateSelectedProjectMfgId(state, payload) {
        state.project.ObjProject.projectMfgId = payload;
        // Object.assign(state.selectedProfile, payload.updates)
    },
    UpdateSelProjAssemName(state, payload) {
        state.project.assembly.name = payload;
        // Object.assign(state.selectedProfile, payload.updates)
    },
    UpdateSelProjAssemNumber(state, payload) {
        state.project.assembly.number = payload;
        // get the position from row id and push on that position
    },
    UpdateSelProjAsseId(state, payload) {
        state.project.assembly.id = payload;
        // get the position from row id and push on that position
    },

    UpdateRowPartName(state, payload) {
        console.log("UpdateRowPartName", payload);
        state.project.bom.rowData[payload.id].name = payload.name;

    },
    UpdateRowImage(state, payload) {

        state.project.bom.rowData[(payload.id - 1)].image = payload.image;

    },
    UpdateRowMaterial(state, payload) {

        state.project.bom.rowData[(payload.id-1)].material = payload.material;

    },
    UpdateRowProcess(state, payload) {


        state.project.bom.rowData[payload.id].process[payload.procIndex] = payload.process;

    },
    UpdateRowQty(state, payload) {

        state.project.bom.rowData[(payload.id - 1)].quantity = payload.quantity;

    },
    UpdateRowTotal(state, payload) {

        state.project.bom.rowData[(payload.id - 1)].total = payload.total;

    },
    UpdateRowType(state, payload) {

        state.project.bom.rowData[(payload.id - 1)].type = payload.type;

    },
    UpdateRowWeight(state, payload) {

        state.project.bom.rowData[(payload.id - 1)].weight = payload.weight;

    },


    UpdatedSelRowIdforProcess(state, payload) {
        state.selRowId = payload;

    },
    UpdatedBOMRowData(state, payload) {
        state.project.bom.rowData = payload;

    },


}

const actions = {

    //async server 

    updateSelctedProjectCurrency(context, payload) {

        context.commit('UpdateSelectedProjCurId', payload)
    },

    updateSelctedProjectMfgLocation(context, payload) {

        context.commit('UpdateSelectedProjMfgLocationId', payload)
    },

    updateSelectedObjProj(context, payload) {

        context.commit('UpdateSelectedObjProj', payload)
    },

    updateSelectedProjectMfgId(context, payload) {

        context.commit('UpdateSelectedProjectMfgId', payload)
    },
    updateSelProjAssemNumber(context, payload) {

        context.commit('UpdateSelProjAssemNumber', payload)
    },
    updateSelProjAssemName(context, payload) {

        context.commit('UpdateSelProjAssemName', payload)
    },
    updateSelProjAsseId(context, payload) {

        context.commit('UpdateSelProjAsseId', payload)
    },

    updateRowPartName(context, payload) {

        context.commit('UpdateRowPartName', payload)

    },
    updateRowImage(context, payload) {

        context.commit('UpdateRowImage', payload)

    },
    updateRowMaterial(context, payload) {

        context.commit('UpdateRowMaterial', payload)

    },
    updateRowProcess(context, payload) {

        context.commit('UpdateRowProcess', payload)

    },
    updateRowQty(context, payload) {

        context.commit('UpdateRowQty', payload)

    },
    updateRowTotal(context, payload) {

        context.commit('UpdateRowTotal', payload)

    },
    updateRowType(context, payload) {

        context.commit('UpdateRowType', payload)

    },
    updateRowWeight(context, payload) {

        context.commit('UpdateRowWeight', payload)

    },


    updatedSelRowIdforProcess(context, payload) {

        context.commit('UpdatedSelRowIdforProcess', payload)

    },

    updatedBOMRowData(context, payload) {

        context.commit('UpdatedBOMRowData', payload)

    },



}

const getters = {

    //manupalute and send to components
    getMfgLocationList: state => {
        return state.mfgLocationList
    },
    getCurrencyList: state => {
        return state.projCurrencyList
    },
    selectedProjCurrrency: state => {
        return state.selectedProjCurId
    },
    selectedProjMfgLocationId: state => {
        return state.selectedProjMfgLocationId
    },
    selectedObjProject: state => {
        return state.project.ObjProject
    },

    getSelProjAssemblyName: state => {
        return state.project.assembly.name
    },
    getSelProjAssemblyId: state => {
        return state.project.assembly.id
    },
    getSelProjAssemblyNumber: state => {
        return state.project.assembly.number
    },
    getBomRowPartname: state => (index) => {

        if (state.project.bom.rowData) {
            return state.project.bom.rowData[index].name
        } else {
            return "No Data is present"
        }
    },
    getSelProjBomRowData: state => {
        return state.project.bom.rowData
    },
    getSelRowId: state => {
        return state.selRowId
    },
    getProjectProcessData: state => (index) => {

        return state.project.bom.rowData[index - 1].process //get requested row process array
    },
    getProjectProcessTotal: state => (index) => {

        return state.project.bom.rowData[index - 1].total //get requested row total array
    }
}

export const project = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}