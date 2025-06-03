/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'i.ticketweb.com',
      'images.ticketmaster.com',
      'i.ticketmaster.com',
      's1.ticketm.net',
      's2.ticketm.net',
      's3.ticketm.net',
      'resizing.flixster.com',
      'content.ticketmaster.com',
      'media.ticketmaster.com',
      'static.ticketmaster.com',
      'www.ticketmaster.com',
      'cdn.ticketmaster.com',
      'maps.ticketmaster.com'
    ],
    unoptimized: true, // This will help with image loading issues
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig 