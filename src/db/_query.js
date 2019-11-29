import { Query } from 'pg'

export default ({ pool, text, values, name }) =>
  new Promise((resolve, reject) =>
    pool.query(
      new Query(
        {
          text,
          values,
          name
        },
        (err, result) => (err ? reject(err) : resolve(result))
      )
    )
  )
