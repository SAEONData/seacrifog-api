'use strict'
import { config } from 'dotenv'
import setupDb from './_setup-db'
import getPool from './_get-pool'
export { default as query } from './_query'
import {
  findSites,
  findNetworks,
  findVariables,
  findProtocols,
  findRadiativeForcings,
  findDataproducts,
  findNetworksOfSite,
  findSitesOfNetwork,
  findVariablesOfNetwork,
  findProtocolsOfVariable,
  findRForcingsOfVariable,
  findDataproductsOfVariable,
  findVariablesOfProtocol,
  findVariablesOfRadiativeForcing,
  findVariablesOfDataproduct
} from './finders'
config()

// Setup constants
const NODE_ENV = process.env.NODE_ENV
const FORCE_DB_RESET = process.env.FORCE_DB_RESET || 'false' // TODO: This is only for development. Remove once app is deployed
const DB = process.env.POSTGRES_DATABASE || 'seacrifog'
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost'
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'password'
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT, 10) || 5432
if (!NODE_ENV || !['production', 'development'].includes(NODE_ENV))
  throw new Error(
    'The server MUST be started with a NODE_ENV environment variable, with a value of either "production" or "development"'
  )

/**
 * Full database reset
 */
if (FORCE_DB_RESET === 'true')
  setupDb({ DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT })

export const pool = getPool({ DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT })

/**
 * This is called once per request
 * DataLoader instances are configured here
 */
export const initializeLoaders = () => ({
  findSites: key => findSites(pool).load(key),
  findNetworks: key => findNetworks(pool).load(key),
  findVariables: key => findVariables(pool).load(key),
  findProtocols: key => findProtocols(pool).load(key),
  findRadiativeForcings: key => findRadiativeForcings(pool).load(key),
  findDataproducts: key => findDataproducts(pool).load(key),
  findSitesOfNetwork: key => findSitesOfNetwork(pool).load(key),
  findVariablesOfNetwork: key => findVariablesOfNetwork(pool).load(key),
  findVariablesOfProtocol: key => findVariablesOfProtocol(pool).load(key),
  findVariablesOfDataproduct: key => findVariablesOfDataproduct(pool).load(key),
  findVariablesOfRadiativeForcing: key => findVariablesOfRadiativeForcing(pool).load(key),
  findNetworksOfSite: key => findNetworksOfSite(pool).load(key),
  findProtocolsOfVariable: key => findProtocolsOfVariable(pool).load(key),
  findRForcingsOfVariable: key => findRForcingsOfVariable(pool).load(key),
  findDataproductsOfVariable: key => findDataproductsOfVariable(pool).load(key),

  allSites: async () =>
    Promise.all(
      (await pool.query('select id from public.sites;')).rows.map(
        async ({ id }) => (await findSites(pool).load(id))[0]
      )
    ),
  allNetworks: async () =>
    Promise.all(
      (await pool.query('select id from public.networks;')).rows.map(
        async ({ id }) => (await findNetworks(pool).load(id))[0]
      )
    ),
  allVariables: async () =>
    Promise.all(
      (await pool.query('select id from public.variables;')).rows.map(
        async ({ id }) => (await findVariables(pool).load(id))[0]
      )
    ),
  allProtocols: async () =>
    Promise.all(
      (await pool.query('select id from public.protocols;')).rows.map(
        async ({ id }) => (await findProtocols(pool).load(id))[0]
      )
    ),
  allDataproducts: async () =>
    Promise.all(
      (await pool.query('select id from public.dataproducts;')).rows.map(
        async ({ id }) => (await findDataproducts(pool).load(id))[0]
      )
    ),
  allRadiativeForcings: async () =>
    Promise.all(
      (await pool.query('select id from public.rforcings;')).rows.map(
        async ({ id }) => (await findRadiativeForcings(pool).load(id))[0]
      )
    ),
  xrefDataproductsVariables: async () =>
    (await pool.query('select * from public.dataproduct_variable_xref;')).rows,
  xrefNetworksVariables: async () =>
    (await pool.query('select * from public.network_variable_xref;')).rows,
  xrefProtocolsVariables: async () =>
    (
      await pool.query(`
          select
          x.id,
          x.protocol_id,
          x.variable_id,
          r.name relationship_type
          from public.protocol_variable_xref x
          join public.relationship_types r on r.id = x.relationship_type_id`)
    ).rows,
  xrefSitesNetworks: async () => (await pool.query('select * from public.site_network_xref;')).rows,

  // Aggregation queries
  aggregationDataproducts: async () =>
    (await pool.query('select count(*) count from public.dataproducts;')).rows
})
