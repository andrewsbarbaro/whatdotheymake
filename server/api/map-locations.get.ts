import { getMapLocations } from '../utils/storage'
import { buildMapLocationsResponse } from '../utils/endpoints/mapLocations'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.max(25, Math.min(300, parseInt(String(query.limit || '250')) || 250))
  const sourceWindow = Math.max(limit * 3, 300)

  const rows = await getMapLocations(event, sourceWindow)
  return await buildMapLocationsResponse(rows, limit)
})
