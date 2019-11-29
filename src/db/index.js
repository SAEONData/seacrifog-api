'use strict'
import { config } from 'dotenv'
import setupDb from './_setup-db'
import getPool from './_get-pool'
export { default as query } from './_query'
import DataLoader from 'dataloader'
import sift from 'sift'
config()

// Setup constants
const NODE_ENV = process.env.NODE_ENV
const FORCE_DB_RESET = process.env.FORCE_DB_RESET || false // TODO: This is only for development. Remove once app is deployed
const DB = process.env.POSTGRES_DATABASE || 'seacrifog'
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost'
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'password'
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT, 10) || 5432

if (!NODE_ENV || !['production', 'development'].includes(NODE_ENV))
  throw new Error(
    'The server MUST be started with a NODE_ENV environment variable, with a value of either "production" or "development"'
  )

export const pool = getPool({ DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT })

if (NODE_ENV === 'development' || FORCE_DB_RESET)
  setupDb({ DB, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT })

/**
 * This is called once per request
 * DataLoader instances are configured here
 */
export const initializeLoaders = () => {
  const dataLoaderOptions = {
    batch: true,
    maxBatchSize: 250,
    cache: true
  }

  const findVariablesOfProtocols = new DataLoader(async keys => {
    const sql = `
    select
    v.*,
    rt."name" relationship_type_name,
    rt.description relationship_type_description,
    x.protocol_id
    from public.protocol_variable_xref x
    join public.variables v on v.id = x.variable_id
    join public.relationship_types rt on rt.id = x.relationship_type_id
    where x.protocol_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ protocol_id: key })) || [])
  }, dataLoaderOptions)

  const findProtocolsOfVariables = new DataLoader(async keys => {
    const sql = `
    select
    p.*,
    rt."name" relationship_type_name,
    rt.description relationship_type_description,
    x.variable_id
    from public.protocol_variable_xref x
    join public.protocols p on p.id = x.protocol_id
    join public.relationship_types rt on rt.id = x.relationship_type_id
    where x.variable_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ variable_id: key })) || [])
  }, dataLoaderOptions)

  const findRForcingsOfVariables = new DataLoader(async keys => {
    const sql = `
    select rf.*,
    x.variable_id
    from public.rforcing_variable_xref x
    join public.rforcings rf on rf.id = x.rforcing_id
    where x.variable_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ variable_id: key })) || [])
  }, dataLoaderOptions)

  const findVariablesOfNetworks = new DataLoader(async keys => {
    const sql = `
    select
    v.*,
    x.network_id
    from public.network_variable_xref x
    join public.variables v on v.id = x.variable_id
    where x.network_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ network_id: key })) || [])
  }, dataLoaderOptions)

  const findNetworksOfSites = new DataLoader(async keys => {
    const sql = `
    select
    n.id,
    n.title,
    n.acronym,
    n.type,
    n.status,
    n.start_year,
    n.end_year,
    n.url_info_id,
    n.url_data_id,
    n.abstract,
    ST_AsGeoJSON(st_transform(n.coverage_spatial, 4326)) coverage_spatial,
    n.url_sites_id,
    n.parent_id,
    n.created_by,
    n.created_at,
    n.modified_by,
    n.modified_at,
    x.site_id
    from public.site_network_xref x
    join public.networks n on n.id = x.network_id
    where x.site_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ site_id: key })) || [])
  }, dataLoaderOptions)

  const findVariablesOfRadiativeForcings = new DataLoader(async keys => {
    const sql = `
    select
    v.*,
    x.rforcing_id
    from public.rforcing_variable_xref x
    join public.variables v on v.id = x.variable_id
    where x.rforcing_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ rforcing_id: key })) || [])
  }, dataLoaderOptions)

  const findVariablesOfDataproducts = new DataLoader(async keys => {
    const sql = `
    select
    v.*,
    x.dataproduct_id
    from public.dataproduct_variable_xref x
    join public.variables v on v.id = x.variable_id
    where x.dataproduct_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ dataproduct_id: key })) || [])
  }, dataLoaderOptions)

  const findDataproductsOfVariables = new DataLoader(async keys => {
    const sql = `
    select
    d.id,
    d.title,
    d.publish_year,
    d.publish_date,
    d.keywords,
    d.abstract,
    d.provider,
    d.author,
    d.contact,
    ST_AsGeoJSON(st_transform(d.coverage_spatial, 4326)) coverage_spatial,
    d.coverage_temp_start,
    d.coverage_temp_end,
    d.res_spatial,
    d.res_spatial_unit,
    d.res_temperature,
    d.res_temperature_unit,
    d.uncertainty,
    d.uncertainty_unit,
    d.doi,
    d.license,
    d.url_download,
    d.file_format,
    d.file_size,
    d.file_size_unit,
    d.url_info,
    d.created_by,
    d.created_at,
    d.modified_by,
    d.modified_at,
    d.present,    
    x.variable_id
    from public.dataproduct_variable_xref x
    join public.dataproducts d on d.id = x.dataproduct_id
    where x.variable_id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ variable_id: key })) || [])
  }, dataLoaderOptions)

  const findVariables = new DataLoader(async keys => {
    const sql = `select * from public.variables where id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ id: key })) || [])
  }, dataLoaderOptions)

  const findProtocols = new DataLoader(async keys => {
    const sql = `select * from public.protocols where id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ id: key })) || [])
  }, dataLoaderOptions)

  const findNetworks = new DataLoader(async keys => {
    const sql = `
    select
    id,
    title,
    acronym,
    "type",
    status,
    start_year,
    end_year,
    url_info_id,
    url_data_id,
    abstract,
    ST_AsGeoJSON(st_transform(coverage_spatial, 4326)) coverage_spatial,
    url_sites_id,
    parent_id,
    created_by,
    created_at,
    modified_by,
    modified_at
    from public.networks where id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ id: key })) || [])
  }, dataLoaderOptions)

  const findSites = new DataLoader(async keys => {
    const sql = `
      select
      id,
      "name",
      ST_AsGeoJSON(st_transform(xyz, 4326)) xyz
      from public.sites
      where id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ id: key })) || [])
  }, dataLoaderOptions)

  const findRadiativeForcings = new DataLoader(async keys => {
    const sql = `
      select
      *
      from public.rforcings
      where id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ id: key })) || [])
  }, dataLoaderOptions)

  const findDataproducts = new DataLoader(async keys => {
    const sql = `
    select
    id,
    title,
    publish_year,
    publish_date,
    keywords,
    abstract,
    provider,
    author,
    contact,
    ST_AsGeoJSON(st_transform(coverage_spatial, 4326)) coverage_spatial,
    coverage_temp_start,
    coverage_temp_end,
    res_spatial,
    res_spatial_unit,
    res_temperature,
    res_temperature_unit,
    uncertainty,
    uncertainty_unit,
    doi,
    license,
    url_download,
    file_format,
    file_size,
    file_size_unit,
    url_info,
    created_by,
    created_at,
    modified_by,
    modified_at,
    present
    
    from public.dataproducts
    
    where id in (${keys.join(',')});`
    const rows = (await pool.query(sql)).rows
    return keys.map(key => rows.filter(sift({ id: key })) || [])
  }, dataLoaderOptions)

  return {
    findVariables: key => findVariables.load(key),
    findVariablesOfNetworks: key => findVariablesOfNetworks.load(key),
    findVariablesOfProtocols: key => findVariablesOfProtocols.load(key),
    findVariablesOfDataproducts: key => findVariablesOfDataproducts.load(key),
    findVariablesOfRadiativeForcings: key => findVariablesOfRadiativeForcings.load(key),
    findDataproducts: key => findDataproducts.load(key),
    findDataproductsOfVariables: key => findDataproductsOfVariables.load(key),
    findRForcingsOfVariables: key => findRForcingsOfVariables.load(key),
    findNetworksOfSites: key => findNetworksOfSites.load(key),
    findProtocols: key => findProtocols.load(key),
    findProtocolsOfVariables: key => findProtocolsOfVariables.load(key),
    findNetworks: key => findNetworks.load(key),
    findSites: key => findSites.load(key),

    /**
     * These aren't dataloaders, but putting them here means they can use the dataloaders
     * This means the SQL attributes (other than id) only has to be defined once
     * There is a limit => if there are many rows in a table another solution will be needed
     */
    allSites: async () =>
      Promise.all(
        (await pool.query('select id from public.sites;')).rows.map(
          async ({ id }) => (await findSites.load(id))[0]
        )
      ),
    allNetworks: async () =>
      Promise.all(
        (await pool.query('select id from public.networks;')).rows.map(
          async ({ id }) => (await findNetworks.load(id))[0]
        )
      ),
    allVariables: async () =>
      Promise.all(
        (await pool.query('select id from public.variables;')).rows.map(
          async ({ id }) => (await findVariables.load(id))[0]
        )
      ),
    allRadiativeForcings: async () =>
      Promise.all(
        (await pool.query('select id from public.rforcings;')).rows.map(
          async ({ id }) => (await findRadiativeForcings.load(id))[0]
        )
      ),
    allProtocols: async () =>
      Promise.all(
        (await pool.query('select id from public.protocols;')).rows.map(
          async ({ id }) => (await findProtocols.load(id))[0]
        )
      ),
    allDataproducts: async () =>
      Promise.all(
        (await pool.query('select id from public.dataproducts;')).rows.map(
          async ({ id }) => (await findDataproducts.load(id))[0]
        )
      ),

    // XREF queries. Currently they don't use dataLoaders, since there ARE
    // dataLoaders that resolve relationships. But sometimes the mapping
    // data is useful directly
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
    xrefSitesNetworks: async () =>
      (await pool.query('select * from public.site_network_xref;')).rows,

    // Aggregation queries
    aggregationDataproducts: async () =>
      (await pool.query('select count(*) count from public.dataproducts;')).rows
  }
}
