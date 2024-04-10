export function ucfirst (str: string) {
  return str[0].toLocaleUpperCase() + str.slice(1)
}

function words (str: string) {
  return str.trim().replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])([0-9])/gi, '$1 $2')
    .replace(/([0-9])([a-z])/gi, '$1 $2')
    .toLocaleLowerCase().split(' ')
}

export function titleCase (str: string) {
  return words(str).filter(w => w.length > 0).map(ucfirst).join(' ')
}

export function escapeRegex (str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}
