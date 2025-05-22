import { defineConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig({
  input: {
    path: 'https://developers.strava.com/swagger/swagger.json',
  },
  output: {
    path: './services/strava',
    clean: true,
  },
  plugins: [
    pluginOas({
      validate: true,
      output: {
        path: './json',
        barrelType: false,
      },
      serverIndex: 0,
      contentType: 'application/json',
      generators: [],
    }),
    pluginTs({
      output: {
        path: './generated/types.ts',
        barrelType: false,
      },
      enumType: 'asConst',
      enumSuffix: 'Enum',
      dateType: 'string',
      unknownType: 'unknown',
      optionalType: 'questionTokenAndUndefined',
      oasType: false,
    }),
    pluginClient({
      baseURL: 'https://www.strava.com/api/v3',
      output: {
        path: './generated/client.ts',
        barrelType: false
      },
      importPath: '../../../fetch.ts'
    }),
  ],
})
