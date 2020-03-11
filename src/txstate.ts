export function isNetID (netid: string) {
  return /^(su-)?[a-z][a-z_]?[a-z][0-9]{1,6}$/i.test(netid)
}

export function extractNetIDFromFederated (login: string) {
  const [possiblenetid, domain] = login.trim().split('@', 2)
  if (domain === 'txstate.edu' && isNetID(possiblenetid)) return possiblenetid.toLocaleLowerCase()
  return undefined
}
