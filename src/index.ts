import fs from 'fs/promises'
import { join } from 'path'
import express from 'express'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
interface Module {
  name: string
  use: express.RequestHandler
  get: express.RequestHandler
  put: express.RequestHandler
  post: express.RequestHandler
  delete: express.RequestHandler
}
async function main({
  apiBaseDir,
  port,
  verbose,
  dev,
}: {
  dev: boolean
  apiBaseDir: string
  port: number
  verbose: boolean
}) {
  const files = await fs.readdir(apiBaseDir, { withFileTypes: true })
  const loadedFiles: Module[] = files.map((file) => {
    const mod = require(join(apiBaseDir, file.name))
    return {
      name: file.name.replace(/\.(t|j)sx?$/, ''),
      use: mod.use,
      get: mod.get,
      put: mod.put,
      post: mod.post,
      delete: mod.delete,
    } as Module
  })
  const app = express()
  app.use((req, res, next) => {
    console.log(req.route)
    next()
  })
  loadedFiles.forEach((file) => {
    const route = `/${file.name}`
    if (file.use) app.use(route, file.use)
    if (file.get) app.get(route, file.get)
    if (file.put) app.put(route, file.put)
    if (file.post) app.post(route, file.post)
    if (file.delete) app.delete(route, file.delete)
  })
  const server = app.listen(port, () => {
    if (verbose) console.log(`Listening on port ${port}`)
  })
  return () =>
    new Promise<void>((resolve, reject) =>
      server.close((err) => {
        if (err) return reject(err)
        resolve()
      })
    )
}
const args = yargs(hideBin(process.argv))
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
    default: false,
  })
  .command(
    'serve',
    'start the server',
    (yargs) => {
      return yargs
        .option('port', {
          alias: 'p',
          describe: 'port to bind on',
          default: 3000,
        })
        .option('dev', {
          alias: 'd',
          describe: 'watch and invalidate routes on file changes',
          default: false,
        })
        .option('apiBaseDir', {
          alias: 'a',
          describe: 'directory to load api files from',
          default: join(process.cwd(), 'hasura-custom-endpoints', 'routes'),
        })
    },
    async (argv) => {
      if (argv.verbose) console.info(`starting server on :${argv.port}...`)
      if (argv.dev) {
        const { default: chokidar } = await import('chokidar')
        let stop: () => Promise<void> = () => Promise.resolve()
        const filesToWatch = join(argv.apiBaseDir, '**/*.ts*')
        console.log('watching', filesToWatch)
        chokidar.watch(filesToWatch).on('all', async (file) => {
          console.log(`change detected in ${file}, reloading...`)
          await stop()
          console.log('server stopped')
          stop = await main(argv)
          console.log('server restarted')
        })
      } else main(argv)
    }
  )
  .demandCommand()
  .parse()
