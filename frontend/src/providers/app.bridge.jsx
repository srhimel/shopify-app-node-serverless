import { Provider } from '@shopify/app-bridge-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * A component to configure App Bridge.
 * @desc A thin wrapper around AppBridgeProvider that provides the following capabilities:
 *
 * 1. Ensures that navigating inside the app updates the host URL.
 * 2. Configures the App Bridge Provider, which unlocks functionality provided by the host.
 *
 * See: https://shopify.dev/apps/tools/app-bridge/react-components
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const history = useMemo(
    () => ({
      replace: (path) => {
        navigate(path, { replace: true })
      }
    }),
    [navigate]
  )

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location]
  )

  // The host may be present initially, but later removed by navigation.
  // By caching this in state, we ensure that the host is never lost.
  // During the lifecycle of an app, these values should never be updated anyway.
  // Using state in this way is preferable to useMemo.
  // See: https://stackoverflow.com/questions/60482318/version-of-usememo-for-caching-a-value-that-will-never-change
  const [appBridgeConfig] = useState(() => {
    const host =
      new URLSearchParams(location.search).get('host') ||
      window.__SHOPIFY_DEV_HOST

    window.__SHOPIFY_DEV_HOST = host

    return {
      host,
      apiKey: process.env.SHOPIFY_API_KEY,
      forceRedirect: true
    }
  })

  console.log({ appBridgeConfig })

  if (!process.env.SHOPIFY_API_KEY || !appBridgeConfig.host) {
    return (
      <div>
        <div style={{ marginTop: '100px' }}>
          <h1>Missing Shopify API Key</h1>
          <p>there is some problem</p>
        </div>
      </div>
    )
  }

  return (
    <Provider config={appBridgeConfig} router={routerConfig}>
      {children}
    </Provider>
  )
}
