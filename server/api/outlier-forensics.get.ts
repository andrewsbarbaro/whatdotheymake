import { getOutlierForensics } from '../utils/storage'

export default defineEventHandler(async (event) => {
  return await getOutlierForensics(event)
})
