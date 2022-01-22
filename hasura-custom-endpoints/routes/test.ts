import _ from 'lodash'
export function get(req, res) {
  res.json({ works: true , test: 'thing'})
  res.end()
}
