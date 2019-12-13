import DataLoader from 'dataloader'
import sift from 'sift'

export default pool =>
  new DataLoader(async keys =>
    keys.map(async key => 'TODO', {
      batch: true,
      maxBatchSize: 250,
      cache: true
    })
  )
