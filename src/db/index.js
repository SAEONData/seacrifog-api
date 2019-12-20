import {
  _findSites,
  _findNetworks,
  _findVariables,
  _findProtocols,
  _findRadiativeForcings,
  _findDataproducts,
  _findNetworksOfSite,
  _findSitesOfNetwork,
  _findVariablesOfNetwork,
  _findProtocolsOfVariable,
  _findRForcingsOfVariable,
  _findDataproductsOfVariable,
  _findVariablesOfRforcing,
  _findVariablesOfProtocol,
  _findVariablesOfDataproduct
} from './finders'
import { default as _query } from './_query'
export { default as setupDb } from './_setup-db'
export const query = _query

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
  const findSitesOfNetwork = _findSitesOfNetwork()
  const findVariablesOfNetwork = _findVariablesOfNetwork()
  const findProtocolsOfVariable = _findProtocolsOfVariable()
  const findRForcingsOfVariable = _findRForcingsOfVariable()
  const findDataproductsOfVariable = _findDataproductsOfVariable()
  const findVariablesOfRforcing = _findVariablesOfRforcing()
  const findVariablesOfProtocol = _findVariablesOfProtocol()
  const findVariablesOfDataproduct = _findVariablesOfDataproduct()

  return {
    findVariables: key => findVariables.load(key),
    findSitesOfNetwork: key => findSitesOfNetwork.load(key),
    findVariablesOfNetwork: key => findVariablesOfNetwork.load(key),
    findVariablesOfProtocol: key => findVariablesOfProtocol.load(key),
    findVariablesOfDataproduct: key => findVariablesOfDataproduct.load(key),
    findVariablesOfRadiativeForcing: key => findVariablesOfRforcing.load(key),
    findDataproducts: key => findDataproducts.load(key),
    findDataproductsOfVariable: key => findDataproductsOfVariable.load(key),
    findRForcingsOfVariable: key => findRForcingsOfVariable.load(key),
    findNetworksOfSite: key => findNetworksOfSite.load(key),
    findProtocols: key => findProtocols.load(key),
    findProtocolsOfVariable: key => findProtocolsOfVariable.load(key),
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
      (await query({ text: 'select count(*) count from public.dataproducts;' })).rows,

      //Site Aggregation test
      aggregationSites: async keys => {
        const sql = `
            SELECT site_id,
            COUNT(id) AS network_count
            FROM public.site_network_xref
            WHERE site_id IN (${keys.join(',')})
            GROUP BY site_id`
        const rows = (await query({text: sql})).rows
        return rows
      }
  }
}
