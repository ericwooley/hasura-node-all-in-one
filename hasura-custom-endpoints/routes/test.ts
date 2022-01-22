import _ from 'lodash'
export function get(req, res) {
  console.log('works', _.VERSION)
  res.json({ works: true })
  res.end()
}

console.log('test')
