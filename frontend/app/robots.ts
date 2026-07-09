import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Uses environment variable or falls back to your actual production domain
  const baseUrl = 'https://www.am-pcd.tech'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Prevent AI and search engines from indexing private areas
      disallow: [
        '/en/dashboard', 
        '/am/dashboard', 
        '/dashboard', 
        '/api/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
