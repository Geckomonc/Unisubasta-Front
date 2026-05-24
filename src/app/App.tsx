import { Providers } from './Providers'
import { AppRouter } from '@/routes/AppRouter'

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
