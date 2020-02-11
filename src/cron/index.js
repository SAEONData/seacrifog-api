import { CronJob } from 'cron'
import icosIntegration from './_icos-integration'
import { logError } from '../lib/log'

const WAIT = process.env.INITIAL_CRON_WAIT || 1000

const handleAsync = fn => (...args) =>
  Promise.resolve(fn(...args)).catch(error => {
    logError('Error running scheduled tasks', error)
  })

const icosIntegrationSchedule = process.env.ICOS_INTEGRATION_SCHEDULE || '*/60 * * * * *'

export default async createCtx =>
  setTimeout(
    () =>
      [
        new CronJob(
          icosIntegrationSchedule,
          handleAsync(() => icosIntegration(createCtx()))
        )
      ].forEach(job => job.start()),
    WAIT
  )
