import { BrowserRouter } from 'react-router-dom'
import { AppBridgeProvider } from './providers/app.bridge'
import Routes from './Routes'

function App() {
  return (
    <BrowserRouter>
      <AppBridgeProvider>
        <Routes />
      </AppBridgeProvider>
    </BrowserRouter>
  )
}

export default App
