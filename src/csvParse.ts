type Comma = ',' | ';' | '|' | '\t'
type Quote = '"' | string
type Leftover = ' ' | '\t' | '\f' | string

class Parser {
  protected input!: string
  protected quote!: Quote
  protected comma!: Comma
  protected curr!: number
  protected lineCurr!: number
  protected leftoversRegEx!: RegExp
  protected separatorRegEx!: RegExp
  protected escapedQuoteRegEx!: RegExp

  constructor (input: string, comma?: Comma, quote?: Quote) {
    this.input = input
    this.curr = 0
    this.lineCurr = 0
    this.comma = (comma && (comma[0] as Comma)) || ','
    this.quote = quote ?? '"'
    let residueChars =
      ' \f\v\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000'
    if (this.comma !== '\t') residueChars += '\t'
    this.leftoversRegEx = new RegExp(`[^${residueChars}]`)
    this.separatorRegEx = new RegExp(`(${this.comma}|[\r\n]+)`)
    this.escapedQuoteRegEx = new RegExp(this.quote + this.quote, 'g')
  }

  toArray (): string[][] {
    const rows: string[][] = []
    while (true) {
      const tempointer = this.curr
      const row: string[] = this.processRow()
      if (row.length > 0) {
        this.lineCurr = tempointer
        rows.push(row)
      } else {
        if (this.lineCurr && this.curr !== this.input.length) {
          rows.pop()
          this.curr = this.lineCurr
        }
        break
      }
      if (this.isEOF()) {
        if (this.lineCurr && this.curr !== this.input.length) {
          rows.pop()
          this.curr = this.lineCurr
        }
        break
      }
    }
    return rows
  }

  protected processRow (): string[] {
    const row: string[] = []
    while (true) {
      row.push(this.getValue())
      if (this.isSeparator()) {
        continue
      }
      if (this.isLineBreak() || this.isEOF()) {
        return row
      } else {
        row.pop()
        return row
      }
    }
  }

  protected getValue (): string {
    const leftover = this.Leftover()
    const quotedvalue = this.QuotedValue()
    if (quotedvalue) {
      const value = quotedvalue
        .slice(1, -1)
        .replace(this.escapedQuoteRegEx, this.quote)
      this.Leftover()
      return value
    }
    const simplevalue = this.SimpleValue()
    if (simplevalue) {
      return leftover ? leftover + simplevalue : simplevalue
    }
    return ''
  }

  protected isSeparator () {
    if (this.input.slice(this.curr, this.curr + this.comma.length) === this.comma) {
      this.curr += this.comma.length
      return true
    }
    return false
  }

  protected isLineBreak () {
    if (this.input.slice(this.curr, this.curr + 2) === '\r\n') {
      this.curr += 2
      return true
    }
    if (this.input.charAt(this.curr) === '\n') {
      this.curr += 1
      return true
    }
    if (this.input.charAt(this.curr) === '\r') {
      this.curr += 1
      return true
    }
    return false
  }

  protected SimpleValue (): string | undefined {
    let value = ''
    const index = this.input
      .slice(this.curr)
      .search(this.separatorRegEx)
    if (this.input.charAt(this.curr) === this.quote) {
      return
    } else if (index === -1) {
      value = this.input.slice(this.curr)
    } else if (index === 0) {
      return
    } else {
      value = this.input.slice(this.curr, this.curr + index)
    }
    this.curr += value.length
    return value
  }

  protected QuotedValue (): string | undefined {
    if (this.input.charAt(this.curr) === this.quote) {
      let searchIndex
      let index = 1
      while (true) {
        searchIndex = this.input.slice(this.curr + index).search(this.quote)
        if (searchIndex === -1) return
        if (this.input.charAt(this.curr + index + searchIndex + 1) === this.quote) {
          index += searchIndex + 2
          continue
        }
        const value = this.input.slice(this.curr, this.curr + index + searchIndex + 1)
        this.curr += value.length
        return value
      }
    }
  }

  protected isEOF () {
    return this.curr >= this.input.length
  }

  protected Leftover (): Leftover {
    let value = ''
    const index = this.input.slice(this.curr).search(this.leftoversRegEx)
    if (index === -1) {
      value = this.input.slice(this.curr)
    } else if (index === 0) {
      return ''
    } else {
      value = this.input.slice(this.curr, this.curr + index)
    }
    this.curr += value.length
    return value
  }
}

export function csvParse (input: string): string[][] {
  const csv = new Parser(input)
  return csv.toArray()
}
