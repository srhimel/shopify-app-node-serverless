import express from 'express'
import { shopifyApp } from '@shopify/shopify-app-express'
import cors from 'cors'
import 'dotenv/config'
import serveStatic from 'serve-static'
import { readFileSync } from 'fs'
import { join } from 'path'
import { LATEST_API_VERSION } from '@shopify/shopify-api'
import webhooks from './server/webhooks/index.js'
import MongoDBSessionStorage from './server/utils/session.mongodb.js'
import { dbName, dbString } from './server/db.js'
import serverless from 'serverless-http'

const PORT = 8080
console.log({ env: process.env.NODE_ENV })

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend`

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    apiVersion: LATEST_API_VERSION,
    scopes: [process.env.SCOPES],
    hostScheme: process.env.HOST_SCHEME,
    hostName: process.env.HOST
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback'
  },
  webhooks: {
    path: '/api/webhooks'
  },
  sessionStorage: new MongoDBSessionStorage(dbString, dbName)
})

const app = express()

app.use(express.json())
app.use(cors())
app.use(
  express.json({
    limit: '50mb'
  })
)

app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
)
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: webhooks })
)

app.use('/api/*', shopify.validateAuthenticatedSession())
app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

app.use('/*', shopify.ensureInstalledOnShop(), async (req, res, _next) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')))
})

if (process.env.NODE_ENV === 'development') {
  app.listen(PORT, () => console.log('Server started'))
}

export const handler = serverless(app)
