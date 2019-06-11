/**
 * Created by jiachenpan on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  return true
}

/**
 * 字符长度不超过64
 * @param {string} str
 * @returns {Boolean}
 */
export function validStrLen(str) {
  return str.length < 65
}
