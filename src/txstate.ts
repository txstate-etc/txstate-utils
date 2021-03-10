import { isEmail } from './util'

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
export function extractNetIDFromFederated (login: string) {
  if (isNetID(login)) return login
  const [possiblenetid, domain] = login.trim().split('@', 2)
  if (domain === 'txstate.edu' && isNetID(possiblenetid)) return possiblenetid.toLocaleLowerCase()
  return undefined
}

/**
 * Detect whether a string is a valid email address on the
 * txstate.edu domain
 */
export function isTxStEmail <T extends string|undefined|null> (email: T): email is Exclude<T, undefined|null> {
  return !!email && isEmail(email) && email.toLocaleLowerCase().endsWith('txstate.edu')
}
