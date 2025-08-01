import type { StricliAutoCompleteContext } from '@stricli/auto-complete'
import type { CommandContext } from '@stricli/core'
import fs from 'fs'
import path from 'path'

export interface LocalContext
  extends CommandContext,
    StricliAutoCompleteContext {
  debug: boolean

  process: {
    stdout: typeof process.stdout
    stderr: typeof process.stderr
    env: typeof process.env
  }
  fs: {
    promises: typeof fs.promises
    mkdirSync: typeof fs.mkdirSync
    existsSync: typeof fs.existsSync
    readFileSync: typeof fs.readFileSync
    writeFileSync: typeof fs.writeFileSync
    appendFileSync: typeof fs.appendFileSync
    readdirSync: typeof fs.readdirSync
    cpSync: typeof fs.cpSync
  }
  path: {
    resolve: typeof path.resolve
    join: typeof path.join
  }
}

export async function buildContext(
  process: NodeJS.Process
): Promise<LocalContext> {
  const debug = Boolean(process.env.DEBUG)

  return {
    debug,

    fs: {
      promises: fs.promises,
      mkdirSync: fs.mkdirSync,
      existsSync: fs.existsSync,
      readFileSync: fs.readFileSync,
      writeFileSync: fs.writeFileSync,
      appendFileSync: fs.appendFileSync,
      readdirSync: fs.readdirSync,
      cpSync: fs.cpSync,
    },
    path: {
      resolve: path.resolve,
      join: path.join,
    },
    process: {
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
    },
  }
}
