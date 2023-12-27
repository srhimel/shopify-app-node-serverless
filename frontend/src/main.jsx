import { createRoot } from 'react-dom/client'
import App from './App'

console.log(window.location)

createRoot(document.getElementById('root')).render(<App />)
