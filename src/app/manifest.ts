import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DR TV - Live TV',
    short_name: 'DR TV',
    description: 'Watch Live TV Channels on DR TV',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/globe.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/globe.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
