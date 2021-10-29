/**
 * escape a string to put inside a csv cell, adds quotes around it only
 * when necessary
 */
export function csvEscape (str: string) {
  if (!/[,\n"]/.test(str)) return str
  return '"' + str.replace(/"/g, '""') + '"'
}

/**
 * encode a full line of csv with properly escaped strings, adds an
 * appropriate line break at the end
 */
export function csvLine (values: string[]) {
  return values.map(csvEscape).join(',') + '\r\n'
}

/**
 * encode a full csv file with proper line breaks and escaped strings
 */
export function csv (lines: string[][]) {
  return lines.map(csvLine).join('')
}
