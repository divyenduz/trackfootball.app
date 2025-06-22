const invariant = require('tiny-invariant')
const dotenv = require('dotenv')
dotenv.config()

const databaseUrl = process.env.DATABASE_URL
invariant(databaseUrl, 'DATABASE_URL is required')

/** @type {import('kanel').Config} */
module.exports = {
  connection: databaseUrl,

  preDeleteOutputFolder: true,
  outputPath: './src/schemas',

  enumStyle: 'type',

  customTypeMap: {
    'pg_catalog.jsonb': {
      name: 'FeatureCollection<LineString>',
      typeImports: [
        {
          name: 'FeatureCollection',
          path: 'geojson',
          isAbsolute: true,
          isDefault: false,
        },
        {
          name: 'LineString',
          path: 'geojson',
          isAbsolute: true,
          isDefault: false,
        },
      ],
    },
  },
}
