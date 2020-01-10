import { parentPort, workerData } from 'worker_threads'
;(async search => {
  parentPort.postMessage({ success: true, result_length: 0, results: [] })
})(workerData).catch(error => {
  console.log('Error executing finder', error)
  throw error
})
