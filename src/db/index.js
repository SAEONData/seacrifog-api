import { config } from 'dotenv'
import setupDb from './_setup-db'
import query from './_query'
import {
  _findSites,
  _findNetworks,
  _findVariables,
  _findProtocols,
  _findRadiativeForcings,
  _findDataproducts,
  _findNetworksOfSite,
  _findVariablesOfNetwork,
  _findProtocolsOfVariable,
  _findRForcingsOfVariable,
  _findVariablesOfRforcing,
  _findVariablesOfProtocol,
  _findVariablesOfDataproduct
} from './finders'
config()

// SETUP DB
if (process.env.FORCE_DB_RESET === 'true') setupDb()

/**
 * This is called once per request
 * DataLoader instances are created here
 */
export const initializeLoaders = () => {
  const findSites = _findSites()
  const findNetworks = _findNetworks()
  const findVariables = _findVariables()
  const findProtocols = _findProtocols()
  const findRadiativeForcings = _findRadiativeForcings()
  const findDataproducts = _findDataproducts()
  const findNetworksOfSite = _findNetworksOfSite()
  const findVariablesOfNetwork = _findVariablesOfNetwork()
  const findProtocolsOfVariable = _findProtocolsOfVariable()
  const findRForcingsOfVariable = _findRForcingsOfVariable()
  const findDataproductsOfVariable = _findProtocolsOfVariable()
  const findVariablesOfRforcing = _findVariablesOfRforcing()
  const findVariablesOfProtocol = _findVariablesOfProtocol()
  const findVariablesOfDataproduct = _findVariablesOfDataproduct()

  return {
    findVariables: key => findVariables.load(key),
    findVariablesOfNetworks: key => findVariablesOfNetwork.load(key),
    findVariablesOfProtocols: key => findVariablesOfProtocol.load(key),
    findVariablesOfDataproducts: key => findVariablesOfDataproduct.load(key),
    findVariablesOfRadiativeForcings: key => findVariablesOfRforcing.load(key),
    findDataproducts: key => findDataproducts.load(key),
    findDataproductsOfVariables: key => findDataproductsOfVariable.load(key),
    findRForcingsOfVariables: key => findRForcingsOfVariable.load(key),
    findNetworksOfSites: key => findNetworksOfSite.load(key),
    findProtocols: key => findProtocols.load(key),
    findProtocolsOfVariables: key => findProtocolsOfVariable.load(key),
    findNetworks: key => findNetworks.load(key),
    findSites: key => findSites.load(key),

    /**
     * These aren't dataloaders, but putting them here means they can use the dataloaders
     * This means the SQL attributes (other than id) only has to be defined once
     * There is a limit => if there are many rows in a table another solution will be needed
     */
    allSites: async () =>
      Promise.all(
        (await query({ text: 'select id from public.sites;' })).rows.map(
          async ({ id }) => (await findSites.load(id))[0]
        )
      ),
    allNetworks: async () =>
      Promise.all(
        (await query({ text: 'select id from public.networks;' })).rows.map(
          async ({ id }) => (await findNetworks.load(id))[0]
        )
      ),
    allVariables: async () =>
      Promise.all(
        (await query({ text: 'select id from public.variables;' })).rows.map(
          async ({ id }) => (await findVariables.load(id))[0]
        )
      ),
    allRadiativeForcings: async () =>
      Promise.all(
        (await query({ text: 'select id from public.rforcings;' })).rows.map(
          async ({ id }) => (await findRadiativeForcings.load(id))[0]
        )
      ),
    allProtocols: async () =>
      Promise.all(
        (await query({ text: 'select id from public.protocols;' })).rows.map(
          async ({ id }) => (await findProtocols.load(id))[0]
        )
      ),
    allDataproducts: async () =>
      Promise.all(
        (await query({ text: 'select id from public.dataproducts;' })).rows.map(
          async ({ id }) => (await findDataproducts.load(id))[0]
        )
      ),

    // XREF queries. Currently they don't use dataLoaders, since there ARE
    // dataLoaders that resolve relationships. But sometimes the mapping
    // data is useful directly
    xrefDataproductsVariables: async () =>
      (await query({ text: 'select * from public.dataproduct_variable_xref;' })).rows,
    xrefNetworksVariables: async () =>
      (await query({ text: 'select * from public.network_variable_xref;' })).rows,
    xrefProtocolsVariables: async () =>
      (
        await query({
          text: `
            select
            x.id,
            x.protocol_id,
            x.variable_id,
            r.name relationship_type
            from public.protocol_variable_xref x
            join public.relationship_types r on r.id = x.relationship_type_id;`
        })
      ).rows,
    xrefSitesNetworks: async () =>
      (await query({ text: 'select * from public.site_network_xref;' })).rows,

    // Aggregation queries
    aggregationDataproducts: async () =>
      (await query({ text: 'select count(*) count from public.dataproducts;' })).rows
  }
}
