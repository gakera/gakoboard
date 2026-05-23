import schemePrintRecords from './schemePrints.json'

export type SchemeTypeLine = 'Scheme' | 'Ongoing Scheme'
export type SchemeSetType = 'archenemy' | 'commander' | 'promo'

export type SchemePrint = {
  id: string
  oracleId: string
  name: string
  oracleText: string
  typeLine: SchemeTypeLine
  setCode: string
  setName: string
  setType: SchemeSetType
  releasedAt: string
  collectorNumber: string
  isReprint: boolean
  artist: string
}

export type SchemeSet = {
  code: string
  name: string
  releasedAt: string
  year: number
  printCount: number
}

export const schemePrints = schemePrintRecords as SchemePrint[]

export const schemeSets: SchemeSet[] = Array.from(
  schemePrints.reduce((sets, print) => {
    const existingSet = sets.get(print.setCode)

    if (existingSet) {
      existingSet.printCount += 1
      return sets
    }

    sets.set(print.setCode, {
      code: print.setCode,
      name: print.setName,
      releasedAt: print.releasedAt,
      year: Number(print.releasedAt.slice(0, 4)),
      printCount: 1,
    })

    return sets
  }, new Map<string, SchemeSet>()),
  ([, set]) => set,
).sort((left, right) => {
  const releaseComparison = left.releasedAt.localeCompare(right.releasedAt)
  return releaseComparison || left.name.localeCompare(right.name)
})

export function getSchemeDeck(
  includedSetCodes: Set<string>,
  includeDuplicatePrintings: boolean,
) {
  const selectedPrints = schemePrints.filter((print) =>
    includedSetCodes.has(print.setCode),
  )

  if (includeDuplicatePrintings) {
    return selectedPrints
  }

  const uniqueSchemes = new Map<string, SchemePrint>()

  selectedPrints.forEach((print) => {
    if (!uniqueSchemes.has(print.oracleId)) {
      uniqueSchemes.set(print.oracleId, print)
    }
  })

  return [...uniqueSchemes.values()]
}

export function countDuplicatePrintings(prints: SchemePrint[]) {
  return prints.length - new Set(prints.map((print) => print.oracleId)).size
}
