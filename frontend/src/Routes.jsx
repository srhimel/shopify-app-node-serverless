import { Route, Routes as ReactRouterRoutes, Link } from 'react-router-dom'
export default function Routes() {
  return (
    <ReactRouterRoutes>
      <Route
        path='/'
        element={
          <div>
            <h1>Hello World</h1>
            <Link to='about'>About Us</Link>
          </div>
        }
      />
      <Route path='about' element={<h1>About Us</h1>} />
    </ReactRouterRoutes>
  )
}
