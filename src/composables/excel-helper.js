// useExcelHelper.js

import { ref } from 'vue'

export function useExcelHelper() {
  // This function generates an array of alphabetic sequences based on the min and max values
  const alphabetList = (min, max) => {
    const alphabet = []
    let char = 64
    for (let j = min; j < max; j++) {
      const m = 65 + j - min
      let k = j - min
      k = k > 25 ? k % 26 : k
      char = m > 90 && k === 0 ? char + 1 : char
      if (m < 91) {
        alphabet[j] = String.fromCharCode(k + 65)
      } else {
        alphabet[j] = String.fromCharCode(char) + String.fromCharCode(k + 65)
      }
    }
    return alphabet
  }

  return {
    alphabetList,
  }
}
