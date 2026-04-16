import { getStats } from '../utils/storage'

export default defineEventHandler(async (event) => {
  const stats = await getStats(event)
  return stats
})
