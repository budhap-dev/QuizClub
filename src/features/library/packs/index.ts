import type { Pack } from '../helpers'
import { flagsPack, flagsEasyPack } from './flags'
import { logosPack } from './logos'
import { mathsPack, mathsEasyPack } from './maths'
import { generalPack } from './general'
import { geographyPack } from './geography'
import { sciencePack } from './science'
import { literaturePack } from './literature'
import { moviesPack } from './movies'
import { sportsPack } from './sports'
import { musicPack } from './music'
import { historyPack } from './history'

export const PACKS: Pack[] = [
  flagsPack,
  flagsEasyPack,
  logosPack,
  generalPack,
  mathsPack,
  mathsEasyPack,
  geographyPack,
  sciencePack,
  literaturePack,
  moviesPack,
  sportsPack,
  musicPack,
  historyPack,
]

export const packById = (id: string) => PACKS.find((p) => p.id === id)
