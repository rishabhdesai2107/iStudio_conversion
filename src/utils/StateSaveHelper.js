// import Cookies from 'js-cookie'
import { Cookies } from 'quasar'
import StateSave from './StateSave'

/**
 * getAddToCart
 * @param { int } $id
 * @return void
 */
const setTableState = (columns, table) => {
  let oldData = Cookies.has('table-state') ? Cookies.get('table-state') : {}
  let stateSave = new StateSave(oldData)
  stateSave.add(columns, table)
  Cookies.set('table-state', stateSave)

  return stateSave
}

/**
 * getCart function
 *
 * @return view
 */
const getTableState = (table) => {
  let oldData = Cookies.has('table-state') ? Cookies.get('table-state') : {}
  return new StateSave(oldData, table)
}

export {
  setTableState,
  getTableState
}