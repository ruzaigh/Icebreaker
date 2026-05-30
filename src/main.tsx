import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import IcebreakerV2 from './IcebreakerV2'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IcebreakerV2 />
  </StrictMode>,
)
