import { SearchProvider } from './base'
import { SearXNGSearchProvider } from './searxng'

// Ye sirf un providers ko list karega jo free/self-hosted hain (searxng).
// 'tavily', 'exa', 'firecrawl' hata diye gaye hain.
export type SearchProviderType = 'searxng' 
export const DEFAULT_PROVIDER: SearchProviderType = 'searxng'

export function createSearchProvider(
  type?: SearchProviderType
): SearchProvider {
  // Ab yeh hamesha 'searxng' ko hi default search provider dekhega
  const providerType =
    type || (process.env.SEARCH_API as SearchProviderType) || DEFAULT_PROVIDER

  switch (providerType) {
    case 'searxng':
      return new SearXNGSearchProvider()
    default:
      // Agar kuch aur specify hua, toh bhi hum searxng hi use karenge.
      return new SearXNGSearchProvider()
  }
}

// Hum sirf SearXNG ko export karte hain
export { SearXNGSearchProvider } from './searxng'
export type { SearchProvider }
