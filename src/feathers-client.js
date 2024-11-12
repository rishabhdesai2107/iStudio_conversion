// src/feathers-client.js
import io from 'socket.io-client'
import feathersVuex from 'feathers-vuex'
import rest from '@feathersjs/rest-client'
import feathers from '@feathersjs/feathers'
//import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client';

import appHooks from './app.hooks'
import store from '@/store/export-store'

const socket = io(process.env.SOCKET_BASE_URL, {
  query: {
    'x-tenant': localStorage.getItem('tenant')
  },
  transports: [process.env.TRANSPORTS],
  autoConnect: true,
  path: process.env.SOCKET_PATH,
  reconnection: true,
  forceNew: true,
  upgrade: false,
  rejectUnauthorized: false
})

socket.on('connection', function() {
  console.log('Socket connected');
});

socket.on('connect', () => {
  console.log('connected', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('reason => ', reason);
  setTimeout(() => {
     store._mutations['VTL/toggleSpinner'][0](false)
  }, 8000);

  if (reason === 'io server disconnect') {
    socket.io.opts.query = {
      'x-tenant': localStorage.getItem('tenant')
    };
    // TODO: the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // TODO: else the socket will automatically try to reconnect
});

socket.on('reconnect_attempt', () => {
  socket.io.opts.transports = [process.env.TRANSPORTS_PRIMARY, process.env.TRANSPORTS_SECONDARY];
  setTimeout(() => {
     store._mutations['VTL/toggleSpinner'][0](false)
  }, 8000);
});

socket.on('error', async (error) => {
  console.log('error => ', error);
  setTimeout(() => {
     store._mutations['VTL/toggleSpinner'][0](false)
  }, 8000);
});


// TODO: push to devlop
const feathersClient = feathers()
  .configure(rest(process.env.API_BASE_URL).fetch(window.fetch))
  .configure(auth({ storage: window.localStorage, storageKey: 'vtl2.0', header: 'x-feathers-jwt' }))
  .hooks(appHooks)

//? Setting up feathers-vuex
const {
  makeServicePlugin,
  makeAuthPlugin,
  BaseModel,
  models, FeathersVuex
} = feathersVuex(
  feathersClient,
  {
    serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
    autoRemove: false, // Indicates that this service will not automatically remove results missing from subsequent requests.
    replaceItems: false, // When set to true, updates and patches will replace the record in the store instead of merging changes
    idField: '_id', // Must match the id field in your database table/collection
    whitelist: ['$regex', '$options', '$elemMatch'],
    skipRequestIfExists: true,
    replaceItems: true,
    debug: true
  }
)

export { socket, makeServicePlugin, makeAuthPlugin, BaseModel, models, FeathersVuex }
export default feathersClient
