import fs from 'fs/promises'
import { join } from 'path'
import express from 'express'

interface Module {
  name: string
  use: express.RequestHandler
  get: express.RequestHandler
  put: express.RequestHandler
  post: express.RequestHandler
  delete: express.RequestHandler
}
async function main({ apiBaseDir }: { apiBaseDir: string }) {
  const files = await fs.readdir(apiBaseDir, { withFileTypes: true })
  const loadedFiles = files.map((file) => {
    const mod = require(join(apiBaseDir, file.name))
    return {
      name: file.name.replace(/\.(t|j)sx?$/, ''),
      use: mod.use,
      get: mod.get,
      put: mod.put,
      post: mod.post,
      delete: mod.delete,
    }
  })
  const app = express()
  loadedFiles.forEach((file) => {
    const route = `/${file.name}`
    if (file.use) app.use(route, file.use)
    if (file.get) app.get(route, file.get)
    if (file.put) app.put(route, file.put)
    if (file.post) app.post(route, file.post)
    if (file.delete) app.delete(route, file.delete)
  })
  app.listen(3000, () => {
    console.log('listening on port 3000')
  })
  console.log(loadedFiles)
}
if (process.argv[1] === __filename) {
  main({ apiBaseDir: join(process.cwd(), 'hasura-custom-endpoints', 'routes') })
}
