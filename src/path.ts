import path from 'node:path'
import vscode from 'vscode'
import { name as bakExt } from './generated/meta'

/**
 * Base dir
 */
export const baseDir = (() => {
  const mainFilename = require.main?.filename
  return mainFilename?.length ? path.dirname(mainFilename) : path.join(vscode.env.appRoot, 'out')
})()
// export const baseDir = path.join(vscode.env.appRoot, 'out')

function getWebviewHTML(ext: string) {
  return path.join(
    baseDir,
    'vs',
    'workbench',
    'contrib',
    'webview',
    'browser',
    'pre',
    `index${ext}`,
  )
}

export const webviewHTMLPath = getWebviewHTML('.html')
export const webviewHTMLBakPath = getWebviewHTML(`.${bakExt}.html`)
/**
 * See https://code.visualstudio.com/api/references/vscode-api#env
 */
function getMainPath(baseExt: string, backupExt?: string) {
  const ext = backupExt ? `${backupExt}.${baseExt}` : baseExt
  return path.join(
    baseDir,
    'vs',
    'workbench',
    // https://github.com/microsoft/vscode/pull/141263
    vscode?.env.appHost === 'desktop'
      ? `workbench.desktop.main.${ext}`
      : `workbench.web.main.${ext}`,
  )
}
/**
 * css file path
 */
export const cssPath = getMainPath('css')
/**
 * css file path
 */
export const cssBakPath = getMainPath('css', bakExt)
/**
 * js file path
 */
export const jsPath = getMainPath('js')
/**
 * js file path
 */
export const jsBakPath = getMainPath('js', bakExt)

export function normalizeUrl(url: string) {
  if (!url.startsWith('file://')) {
    return url
  }
  // file:///Users/foo/bar.png => vscode-file://vscode-app/Users/foo/bar.png
  return vscode.Uri.parse(url.replace('file://', 'vscode-file://vscode-app')).toString()
}
