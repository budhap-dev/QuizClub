import type { Question } from '@/types'
import { sample, shuffle } from '@/utils'
import { mcq, type Pack } from '../helpers'

/**
 * Brand logos served from the Simple Icons CDN (CC0). Slug → display name.
 * Using the coloured variant so logos are recognisable on the dark stage.
 */
export const BRANDS: [string, string][] = [
  ['adidas', 'Adidas'], ['airbnb', 'Airbnb'], ['amazon', 'Amazon'], ['android', 'Android'], ['apple', 'Apple'],
  ['audi', 'Audi'], ['bmw', 'BMW'], ['burgerking', 'Burger King'], ['cocacola', 'Coca-Cola'], ['discord', 'Discord'],
  ['dominos', "Domino's"], ['ebay', 'eBay'], ['ferrari', 'Ferrari'], ['github', 'GitHub'], ['google', 'Google'],
  ['ikea', 'IKEA'], ['instagram', 'Instagram'], ['kfc', 'KFC'], ['lego', 'LEGO'], ['linkedin', 'LinkedIn'],
  ['mcdonalds', "McDonald's"], ['mercedes', 'Mercedes-Benz'], ['microsoft', 'Microsoft'], ['nasa', 'NASA'], ['netflix', 'Netflix'],
  ['nike', 'Nike'], ['nintendo', 'Nintendo'], ['pepsi', 'Pepsi'], ['pinterest', 'Pinterest'], ['playstation', 'PlayStation'],
  ['porsche', 'Porsche'], ['puma', 'Puma'], ['reddit', 'Reddit'], ['samsung', 'Samsung'], ['shell', 'Shell'],
  ['snapchat', 'Snapchat'], ['spotify', 'Spotify'], ['starbucks', 'Starbucks'], ['tesla', 'Tesla'], ['tiktok', 'TikTok'],
  ['toyota', 'Toyota'], ['twitch', 'Twitch'], ['uber', 'Uber'], ['visa', 'Visa'], ['volkswagen', 'Volkswagen'],
  ['whatsapp', 'WhatsApp'], ['wikipedia', 'Wikipedia'], ['xbox', 'Xbox'], ['youtube', 'YouTube'], ['zoom', 'Zoom'],
  ['redbull', 'Red Bull'], ['lamborghini', 'Lamborghini'], ['honda', 'Honda'], ['hyundai', 'Hyundai'], ['intel', 'Intel'],
  ['nvidia', 'NVIDIA'], ['paypal', 'PayPal'], ['mastercard', 'Mastercard'], ['telegram', 'Telegram'], ['duolingo', 'Duolingo'],
]

export const logoUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}`

export function buildLogoQuestions(count: number): Question[] {
  return sample(BRANDS, count).map(([slug, name]) => {
    const wrong = sample(BRANDS.filter(([s]) => s !== slug).map(([, n]) => n), 3)
    const options = shuffle([name, ...wrong])
    return mcq({ q: 'Which brand is this logo?', options, answer: options.indexOf(name), image: logoUrl(slug) }, 10, 15)
  })
}

export const logosPack: Pack = {
  id: 'logos',
  title: 'Logo Quiz',
  emoji: '🏷️',
  category: 'logos',
  description: 'Guess the brand from its logo.',
  color: '#fbbf24',
  poolSize: BRANDS.length,
  build: buildLogoQuestions,
}
