import type { Promisable } from '@subframe7536/type-utils'
import { createHash } from 'node:crypto'
import { config, getFamilies } from '../config'
import { escapeQuote, generateStyleFromObject, logger } from '../utils'
import { BaseFileManager } from './base'

const entry = `'<!DOCTYPE html>\\n' + newDocument.documentElement.outerHTML`

const defaultMonospaceSelector: string[] = ['.font-mono', 'code', 'pre', '.mono', '.monospace']
const defaultSansSerifSelector: string[] = ['.font-sans', '.github-markdown-body']

function getCSS() {
  const { monospace, sansSerif } = getFamilies()
  const {
    webviewSansSerifSelector = [],
    webviewMonospaceSelector = [],
    webviewStylesheet,
  } = config
  let result = ''
  if (monospace) {
    const monoSelectors = [...defaultMonospaceSelector, ...webviewMonospaceSelector]
    result += `${monoSelectors}{font-family:${escapeQuote(monospace)}!important}`
  }
  if (sansSerif) {
    const sansSelectors = [...defaultSansSerifSelector, ...webviewSansSerifSelector]
    result += `${sansSelectors}{font-family:${escapeQuote(sansSerif)}!important}`
  }
  if (webviewStylesheet) {
    result += generateStyleFromObject(webviewStylesheet)
  }
  return result
}

export function fixSha256(html: string) {
  const [,scriptString] = html.match(/<script async type="module">([\s\S]*?)<\/script>/) || []
  if (!scriptString) {
    return html
  }
  const sha = createHash('sha256').update(scriptString).digest('base64')
  logger.info('update script sha256', sha)
  return html.replace(/'sha256-[^']*'/, `'sha256-${sha}'`)
}

export class WebViewFileManager extends BaseFileManager {
  patch(content: string): Promisable<string> {
    return fixSha256(
      content.replace(
        entry,
        `${entry}.replace('</body>', '</body><style>${getCSS()}</style>')`,
      ),
    )
  }
}
