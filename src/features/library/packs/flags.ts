import type { Question } from '@/types'
import { sample, shuffle } from '@/utils'
import { mcq, type Pack } from '../helpers'

// ISO 3166-1 alpha-2 code → country name. Images come from flagcdn.com (free, no key).
export const COUNTRIES: [string, string][] = [
  ['af', 'Afghanistan'], ['al', 'Albania'], ['dz', 'Algeria'], ['ad', 'Andorra'], ['ao', 'Angola'], ['ar', 'Argentina'],
  ['am', 'Armenia'], ['au', 'Australia'], ['at', 'Austria'], ['az', 'Azerbaijan'], ['bs', 'Bahamas'], ['bh', 'Bahrain'],
  ['bd', 'Bangladesh'], ['bb', 'Barbados'], ['by', 'Belarus'], ['be', 'Belgium'], ['bz', 'Belize'], ['bj', 'Benin'],
  ['bt', 'Bhutan'], ['bo', 'Bolivia'], ['ba', 'Bosnia and Herzegovina'], ['bw', 'Botswana'], ['br', 'Brazil'], ['bn', 'Brunei'],
  ['bg', 'Bulgaria'], ['bf', 'Burkina Faso'], ['bi', 'Burundi'], ['kh', 'Cambodia'], ['cm', 'Cameroon'], ['ca', 'Canada'],
  ['cv', 'Cape Verde'], ['cf', 'Central African Republic'], ['td', 'Chad'], ['cl', 'Chile'], ['cn', 'China'], ['co', 'Colombia'],
  ['km', 'Comoros'], ['cg', 'Congo'], ['cd', 'DR Congo'], ['cr', 'Costa Rica'], ['hr', 'Croatia'], ['cu', 'Cuba'],
  ['cy', 'Cyprus'], ['cz', 'Czechia'], ['dk', 'Denmark'], ['dj', 'Djibouti'], ['dm', 'Dominica'], ['do', 'Dominican Republic'],
  ['ec', 'Ecuador'], ['eg', 'Egypt'], ['sv', 'El Salvador'], ['gq', 'Equatorial Guinea'], ['er', 'Eritrea'], ['ee', 'Estonia'],
  ['sz', 'Eswatini'], ['et', 'Ethiopia'], ['fj', 'Fiji'], ['fi', 'Finland'], ['fr', 'France'], ['ga', 'Gabon'],
  ['gm', 'Gambia'], ['ge', 'Georgia'], ['de', 'Germany'], ['gh', 'Ghana'], ['gr', 'Greece'], ['gd', 'Grenada'],
  ['gt', 'Guatemala'], ['gn', 'Guinea'], ['gw', 'Guinea-Bissau'], ['gy', 'Guyana'], ['ht', 'Haiti'], ['hn', 'Honduras'],
  ['hu', 'Hungary'], ['is', 'Iceland'], ['in', 'India'], ['id', 'Indonesia'], ['ir', 'Iran'], ['iq', 'Iraq'],
  ['ie', 'Ireland'], ['il', 'Israel'], ['it', 'Italy'], ['ci', 'Ivory Coast'], ['jm', 'Jamaica'], ['jp', 'Japan'],
  ['jo', 'Jordan'], ['kz', 'Kazakhstan'], ['ke', 'Kenya'], ['ki', 'Kiribati'], ['kw', 'Kuwait'], ['kg', 'Kyrgyzstan'],
  ['la', 'Laos'], ['lv', 'Latvia'], ['lb', 'Lebanon'], ['ls', 'Lesotho'], ['lr', 'Liberia'], ['ly', 'Libya'],
  ['li', 'Liechtenstein'], ['lt', 'Lithuania'], ['lu', 'Luxembourg'], ['mg', 'Madagascar'], ['mw', 'Malawi'], ['my', 'Malaysia'],
  ['mv', 'Maldives'], ['ml', 'Mali'], ['mt', 'Malta'], ['mh', 'Marshall Islands'], ['mr', 'Mauritania'], ['mu', 'Mauritius'],
  ['mx', 'Mexico'], ['fm', 'Micronesia'], ['md', 'Moldova'], ['mc', 'Monaco'], ['mn', 'Mongolia'], ['me', 'Montenegro'],
  ['ma', 'Morocco'], ['mz', 'Mozambique'], ['mm', 'Myanmar'], ['na', 'Namibia'], ['nr', 'Nauru'], ['np', 'Nepal'],
  ['nl', 'Netherlands'], ['nz', 'New Zealand'], ['ni', 'Nicaragua'], ['ne', 'Niger'], ['ng', 'Nigeria'], ['kp', 'North Korea'],
  ['mk', 'North Macedonia'], ['no', 'Norway'], ['om', 'Oman'], ['pk', 'Pakistan'], ['pw', 'Palau'], ['pa', 'Panama'],
  ['pg', 'Papua New Guinea'], ['py', 'Paraguay'], ['pe', 'Peru'], ['ph', 'Philippines'], ['pl', 'Poland'], ['pt', 'Portugal'],
  ['qa', 'Qatar'], ['ro', 'Romania'], ['ru', 'Russia'], ['rw', 'Rwanda'], ['kn', 'Saint Kitts and Nevis'], ['lc', 'Saint Lucia'],
  ['vc', 'Saint Vincent and the Grenadines'], ['ws', 'Samoa'], ['sm', 'San Marino'], ['st', 'São Tomé and Príncipe'],
  ['sa', 'Saudi Arabia'], ['sn', 'Senegal'], ['rs', 'Serbia'], ['sc', 'Seychelles'], ['sl', 'Sierra Leone'], ['sg', 'Singapore'],
  ['sk', 'Slovakia'], ['si', 'Slovenia'], ['sb', 'Solomon Islands'], ['so', 'Somalia'], ['za', 'South Africa'], ['kr', 'South Korea'],
  ['ss', 'South Sudan'], ['es', 'Spain'], ['lk', 'Sri Lanka'], ['sd', 'Sudan'], ['sr', 'Suriname'], ['se', 'Sweden'],
  ['ch', 'Switzerland'], ['sy', 'Syria'], ['tw', 'Taiwan'], ['tj', 'Tajikistan'], ['tz', 'Tanzania'], ['th', 'Thailand'],
  ['tl', 'Timor-Leste'], ['tg', 'Togo'], ['to', 'Tonga'], ['tt', 'Trinidad and Tobago'], ['tn', 'Tunisia'], ['tr', 'Turkey'],
  ['tm', 'Turkmenistan'], ['tv', 'Tuvalu'], ['ug', 'Uganda'], ['ua', 'Ukraine'], ['ae', 'United Arab Emirates'],
  ['gb', 'United Kingdom'], ['us', 'United States'], ['uy', 'Uruguay'], ['uz', 'Uzbekistan'], ['vu', 'Vanuatu'],
  ['va', 'Vatican City'], ['ve', 'Venezuela'], ['vn', 'Vietnam'], ['ye', 'Yemen'], ['zm', 'Zambia'], ['zw', 'Zimbabwe'],
]

export const flagUrl = (code: string) => `https://flagcdn.com/w640/${code}.png`

/** Countries most people recognise – used at "easy" difficulty and for AI image lookups. */
const WELL_KNOWN = new Set([
  'au', 'br', 'ca', 'cn', 'fr', 'de', 'in', 'it', 'jp', 'mx', 'nl', 'nz', 'no', 'pt', 'ru', 'za', 'kr', 'es', 'se', 'ch',
  'tr', 'gb', 'us', 'ar', 'eg', 'ie', 'gr', 'dk', 'fi', 'pl', 'th', 'vn', 'sa', 'ae', 'pk', 'bd', 'lk', 'ng', 'ke', 'jm',
])

export function buildFlagQuestions(count: number, difficulty: 'easy' | 'hard' | 'mixed' = 'mixed'): Question[] {
  const pool = difficulty === 'easy' ? COUNTRIES.filter(([c]) => WELL_KNOWN.has(c)) : difficulty === 'hard' ? COUNTRIES.filter(([c]) => !WELL_KNOWN.has(c)) : COUNTRIES
  return sample(pool, count).map(([code, name]) => {
    const wrong = sample(
      COUNTRIES.filter(([c]) => c !== code).map(([, n]) => n),
      3,
    )
    const options = shuffle([name, ...wrong])
    return mcq({ q: 'Which country does this flag belong to?', options, answer: options.indexOf(name), image: flagUrl(code) }, 10, 15)
  })
}

export const flagsPack: Pack = {
  id: 'flags',
  title: 'Flag Guesser',
  emoji: '🚩',
  category: 'flags',
  description: 'Name the country from its flag. Every round is different!',
  color: '#ff4d8d',
  poolSize: COUNTRIES.length,
  build: (n) => buildFlagQuestions(n),
}

export const flagsEasyPack: Pack = {
  ...flagsPack,
  id: 'flags-easy',
  title: 'Flag Guesser (Easy)',
  description: 'Well-known flags from around the world.',
  poolSize: WELL_KNOWN.size,
  build: (n) => buildFlagQuestions(n, 'easy'),
}
