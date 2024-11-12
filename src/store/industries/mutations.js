import _ from 'loadsh'

const updateIndustry = (state, payload) => {
  state.industryList = _.uniqBy(payload, '_id')
}

export {
  updateIndustry
}