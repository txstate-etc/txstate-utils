export type ObjectOrArray = Record<string, any> | Array<any> | null | undefined
export const pathSeperatorRegex = /\[\s*(['"])(.*?)\1\s*\]|(?:^|\.)\s*([\w/$-]+)\s*(?=\.|\[|$)|\[\s*(-?\d+)\s*\]/g
