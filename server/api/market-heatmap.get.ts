import { getMarketHeatmap } from '../utils/storage'

export default defineEventHandler(async (event) => {
  return await getMarketHeatmap(event)
})
