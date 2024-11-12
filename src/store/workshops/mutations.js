import _ from 'loadsh'

const updateWorkshopIdeaList = (state, payload) => {
  state.workshopIdeaList = _.uniqBy(payload, '_id')
}

export {
  updateWorkshopIdeaList
}