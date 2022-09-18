export const disallowedKeys = new Set<string | number>()
disallowedKeys.add('__proto__')
disallowedKeys.add('prototype')
disallowedKeys.add('constructor')
