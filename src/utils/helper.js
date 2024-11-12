

/**
 * request
 * @param { Any } data
 * @returns { Promise }
 */
const request = (param) => {
  const { url, endpoint, headers, method, data, mode } = param
  const endPoint = url
    ? `${url}`
    : `${process.env.API_BASE_URL}/${endpoint}`

  return fetch(endPoint, {
    method,
    mode: mode ? mode : 'cors',
    headers: {
      "content-type": "application/json",
      'x-tenant':  localStorage.getItem('tenant'),
      'x-charge-code': localStorage.getItem('CURRENT_CHARGE_CODE'),
      'x-feathers-jwt': `Bearer ${localStorage.getItem("vtl2.0")}`,
       authorization: `Bearer ${localStorage.getItem("authorization")}`,        
       ...headers
    },
    body: JSON.stringify(data)
  }).then(r => r.json())
}

/**
 * transposeArray
 * @param {Array} data 
 */
const transposeArray = (data) => { 
  for (var i = 0; i < data.length; i++) { 
    for (var j = 0; j < i; j++) { 
      const tmp = data[i][j]; 
      data[i][j] = data[j][i]; 
      data[j][i] = tmp; 
    } 
  }
  return data
} 

export {
   request,
  transposeArray
}
