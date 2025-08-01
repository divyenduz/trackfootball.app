#!/usr/bin/env node
import { proposeCompletions } from '@stricli/core'
import { app } from '../app'
import { buildContext } from 'src/context'

const inputs = process.argv.slice(3)
if (process.env['COMP_LINE']?.endsWith(' ')) {
  inputs.push('')
}
await proposeCompletions(app, inputs, await buildContext(process))
try {
  for (const { completion } of await proposeCompletions(
    app,
    inputs,
    await buildContext(process)
  )) {
    process.stdout.write(`${completion}\n`)
  }
} catch {
  // ignore
}
