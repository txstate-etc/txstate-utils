import { isEmail } from './util'

export function isNetID (netid: string) {
  return /^(su-)?([a-z-][a-z_]?[a-z]|[a-z][a-z_]?[a-z-])[0-9]{1,6}$/i.test(netid)
}

export function extractNetIDFromFederated (login: string) {
  if (isNetID(login)) return login
  const [possiblenetid, domain] = login.trim().split('@', 2)
  if (domain === 'txstate.edu' && isNetID(possiblenetid)) return possiblenetid.toLocaleLowerCase()
  return undefined
}

export function isTxStEmail <T extends string|undefined|null> (email: T): email is Exclude<T, undefined|null> {
  return !!email && isEmail(email) && email.toLocaleLowerCase().endsWith('txstate.edu')
}
