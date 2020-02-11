import { CronJob } from 'cron'
import icosIntegration from './_icos-integration'
import { logError, log } from '../lib/log'

const WAIT = process.env.INITIAL_CRON_WAIT || 1000
log('Scheduled task delay set', WAIT)

const ICOS_INTEGRATION_SCHEDULE = process.env.ICOS_INTEGRATION_SCHEDULE || '* * * * *'
log('ICOS integration interval', ICOS_INTEGRATION_SCHEDULE)

const handleAsync = fn => (...args) =>
  Promise.resolve(fn(...args)).catch(error => {
    logError('Error running scheduled tasks', error)
  })

export default async createCtx =>
  setTimeout(
    () =>
      [
        new CronJob(
          ICOS_INTEGRATION_SCHEDULE,
          handleAsync(() => icosIntegration(createCtx()))
        )
      ].forEach(job => job.start()),
    WAIT
  )
