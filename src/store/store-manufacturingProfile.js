

const state = {
    selectedProfile: {
        mfgProfname: "Please Click To Select",
        mfgProfId: "0"
    },
    //data
    mfgProfiles: {

    }, mfgAllProfiles: {

    }



}

const mutations = {

    //methods to manupulate the data sync
    UPDATESELECTEDPROFILE(state, payload) {
        state.selectedProfile = payload;
        // Object.assign(state.selectedProfile, payload.updates)
    },
    SETMFGPROFILES(state, payload) {

        state.mfgAllProfiles = payload;
        console.log("MFGPRIFILE", state.mfgAllProfiles)
    }

}

const actions = {

    //async server 

    updateShiftProfile(context, payload) {

        context.commit('UPDATESELECTEDPROFILE', payload)
    },

    loadShiftProfile(context, payload) {

        context.commit('SETMFGPROFILES', payload)

    }

}

const getters = {

    //manupalute and send to components
    mfgProfiles: state => {
        return state.mfgAllProfiles[state.selectedProfile.mfgProfId]
    },
    mfgAllProfiles: state => {
        return state.mfgAllProfiles
        //get from backedn

    },
    selectedProfile: state => {
        return state.selectedProfile
    },
    selectedProfileOHData: state => {
        return state.mfgAllProfiles[state.selectedProfile.mfgProfId].OverHeadData
    }
}

export const mfgstore1 = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}