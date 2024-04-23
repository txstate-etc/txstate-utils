import { isBlank, isEmail } from './util.js'

/**
 * Detect whether a whole string matches a Texas State Net ID
 */
export function isNetID (netid: string) {
  return /^(su-)?([a-z-][a-z_]?[a-z]|[a-z][a-z_]?[a-z-])[0-9]{1,6}$/i.test(netid)
}

/**
 * If an input could be either a NetID or a federated NetID (e.g.
 * abc123@txstate.edu), this function will return the bare NetID
 * (e.g. abc123)
 *
 * If it does not look like either one, returns undefined
 */
export function extractNetIDFromFederated (login: string | undefined | null) {
  if (isBlank(login)) return undefined
  const lclogin = login.trim().toLocaleLowerCase()
  if (isNetID(lclogin)) return lclogin
  const [possiblenetid, domain] = lclogin.split('@')
  if (['txstate.edu', 'txst.edu'].includes(domain) && isNetID(possiblenetid)) return possiblenetid
  return undefined
}

export function federatedFromNetID (netid: string) {
  return `${netid}@txstate.edu`
}

/**
 * Detect whether a string is a valid email address on the
 * txstate.edu domain
 */
export function isTxStEmail <T extends string | undefined | null> (email: T): email is Exclude<T, undefined | null> {
  if (!email) return false
  if (!isEmail(email)) return false
  return /@[^@]*?txst(ate)?.edu$/i.test(email)
}
