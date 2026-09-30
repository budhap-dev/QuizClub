import type { Question } from '@/types'
import { sample, shuffle } from '@/utils'
import { mcq, type Pack } from '../helpers'

/**
 * Brand logos served from the Simple Icons CDN (CC0). Slug → display name → fact shown after the reveal.
 * Using the coloured variant so logos are recognisable on the dark stage.
 */
export const BRANDS: [string, string, string][] = [
  ['adidas', 'Adidas', 'Founded in 1949 in Herzogenaurach, Germany, by Adi Dassler.'],
  ['airbnb', 'Airbnb', 'Originally called AirBed & Breakfast, after the air mattresses its founders rented out.'],
  ['amazon', 'Amazon', "Founded by Jeff Bezos in 1994. The logo's arrow points from A to Z."],
  ['android', 'Android', 'Android Inc. was founded in 2003 and bought by Google in 2005.'],
  ['apple', 'Apple', 'Founded in 1976 by Steve Jobs, Steve Wozniak and Ronald Wayne.'],
  ['audi', 'Audi', 'The four rings stand for the four companies that merged to form Auto Union in 1932.'],
  ['bmw', 'BMW', 'BMW stands for Bayerische Motoren Werke (Bavarian Motor Works).'],
  ['burgerking', 'Burger King', 'Founded in 1953 in Jacksonville, Florida, as Insta-Burger King.'],
  ['cocacola', 'Coca-Cola', 'Invented in 1886 by pharmacist John Pemberton in Atlanta, Georgia.'],
  ['discord', 'Discord', 'Launched in 2015 by Jason Citron and Stanislav Vishnevskiy.'],
  ['dominos', "Domino's", "The logo's three dots represent the company's first three stores."],
  ['ebay', 'eBay', 'Founded in 1995 by Pierre Omidyar, originally as AuctionWeb.'],
  ['ferrari', 'Ferrari', "The prancing horse was painted on WWI pilot Francesco Baracca's plane."],
  ['github', 'GitHub', 'Launched in 2008. Its cat-octopus mascot is called the Octocat.'],
  ['google', 'Google', 'The name is a play on "googol", the number 1 followed by 100 zeros.'],
  ['ikea', 'IKEA', "Founded in 1943 by Ingvar Kamprad. The name uses his initials, farm and village."],
  ['instagram', 'Instagram', 'Launched in 2010. The name blends "instant camera" and "telegram".'],
  ['kfc', 'KFC', 'KFC stands for Kentucky Fried Chicken, founded by Colonel Harland Sanders.'],
  ['lego', 'LEGO', 'The name comes from the Danish "leg godt", meaning "play well".'],
  ['linkedin', 'LinkedIn', 'Co-founded by Reid Hoffman in 2002 and launched in 2003.'],
  ['mcdonalds', "McDonald's", 'Started in 1940 by brothers Richard and Maurice McDonald in San Bernardino, California.'],
  ['mercedes', 'Mercedes-Benz', 'The three-pointed star stands for motoring on land, on sea and in the air.'],
  ['microsoft', 'Microsoft', 'Founded in 1975 by Bill Gates and Paul Allen.'],
  ['nasa', 'NASA', 'Established in 1958. The round blue logo is nicknamed "the meatball".'],
  ['netflix', 'Netflix', 'Founded in 1997, it began by renting DVDs by mail.'],
  ['nike', 'Nike', 'The name comes from the Greek goddess of victory.'],
  ['nintendo', 'Nintendo', 'Founded in 1889 in Kyoto, Japan, making hanafuda playing cards.'],
  ['pepsi', 'Pepsi', "Created in 1893 by pharmacist Caleb Bradham and first called Brad's Drink."],
  ['pinterest', 'Pinterest', 'Launched in 2010. The name combines "pin" and "interest".'],
  ['playstation', 'PlayStation', 'Sony launched the first PlayStation in Japan in 1994.'],
  ['porsche', 'Porsche', 'The crest combines the Stuttgart horse with the colours of Württemberg.'],
  ['puma', 'Puma', 'Founded in 1948 by Rudolf Dassler, brother of Adidas founder Adi Dassler.'],
  ['reddit', 'Reddit', 'Founded in 2005. The name is a play on "I read it".'],
  ['samsung', 'Samsung', 'Founded in 1938 in Korea. The name means "three stars".'],
  ['shell', 'Shell', "Named after the seashells the founders' father sold in London."],
  ['snapchat', 'Snapchat', 'The ghost in its logo is called Ghostface Chillah.'],
  ['spotify', 'Spotify', 'Founded in 2006 in Stockholm, Sweden, by Daniel Ek and Martin Lorentzon.'],
  ['starbucks', 'Starbucks', 'Named after the first mate in Moby-Dick. The logo shows a twin-tailed siren.'],
  ['tesla', 'Tesla', 'Founded in 2003 and named after the inventor Nikola Tesla.'],
  ['tiktok', 'TikTok', 'Made by ByteDance. Its Chinese sister app, launched in 2016, is called Douyin.'],
  ['toyota', 'Toyota', 'Founded by Kiichiro Toyoda. The name was changed from "Toyoda" to "Toyota".'],
  ['twitch', 'Twitch', 'Started in 2011 as a gaming spin-off of the site Justin.tv.'],
  ['uber', 'Uber', 'Founded in San Francisco in 2009, originally called UberCab.'],
  ['visa', 'Visa', "Began in 1958 as Bank of America's BankAmericard."],
  ['volkswagen', 'Volkswagen', 'The name means "people\'s car" in German.'],
  ['whatsapp', 'WhatsApp', 'Founded in 2009 by Jan Koum and Brian Acton. The name plays on "What\'s up?"'],
  ['wikipedia', 'Wikipedia', 'Launched in 2001. Its globe logo is made of jigsaw puzzle pieces.'],
  ['xbox', 'Xbox', 'The name is short for "DirectX Box", after Microsoft\'s graphics technology.'],
  ['youtube', 'YouTube', 'Founded in 2005. Its first video, "Me at the zoo", was posted by a co-founder.'],
  ['zoom', 'Zoom', 'Founded in 2011 by Eric Yuan, a former Cisco engineer.'],
  ['redbull', 'Red Bull', 'Inspired by the Thai energy drink Krating Daeng, meaning "red gaur".'],
  ['lamborghini', 'Lamborghini', 'Founded in 1963 by Ferruccio Lamborghini, who also made tractors.'],
  ['honda', 'Honda', 'Founded in 1948 by Soichiro Honda in Japan.'],
  ['hyundai', 'Hyundai', 'The slanted H in its logo also represents two people shaking hands.'],
  ['intel', 'Intel', 'Named after "integrated electronics". Founded in 1968 by Robert Noyce and Gordon Moore.'],
  ['nvidia', 'NVIDIA', 'Founded in 1993 by Jensen Huang, Chris Malachowsky and Curtis Priem.'],
  ['paypal', 'PayPal', "Grew out of the 2000 merger of Confinity and Elon Musk's X.com."],
  ['mastercard', 'Mastercard', 'Began as Interbank, then Master Charge, before becoming Mastercard in 1979.'],
  ['telegram', 'Telegram', 'Launched in 2013 by brothers Pavel and Nikolai Durov.'],
  ['duolingo', 'Duolingo', 'Founded in Pittsburgh by Luis von Ahn and Severin Hacker. Its owl is named Duo.'],
]

export const logoUrl = (slug: string) => `https://cdn.simpleicons.org/${slug}`

export function buildLogoQuestions(count: number): Question[] {
  return sample(BRANDS, count).map(([slug, name, fact]) => {
    const wrong = sample(BRANDS.filter(([s]) => s !== slug).map(([, n]) => n), 3)
    const options = shuffle([name, ...wrong])
    return mcq({ q: 'Which brand is this logo?', options, answer: options.indexOf(name), image: logoUrl(slug), note: fact }, 10, 15)
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
