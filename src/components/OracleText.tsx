import blackMana from '../assets/mana/B.svg'
import colorlessMana from '../assets/mana/C.svg'
import greenMana from '../assets/mana/G.svg'
import redMana from '../assets/mana/R.svg'
import blueMana from '../assets/mana/U.svg'
import whiteMana from '../assets/mana/W.svg'

type OracleTextProps = {
  className?: string
  text: string
  textScale?: number
}

const manaSymbols: Record<string, string> = {
  B: blackMana,
  C: colorlessMana,
  G: greenMana,
  R: redMana,
  U: blueMana,
  W: whiteMana,
}

const manaTokenPattern = /(\{[^}]+\})/g

export function OracleText({ className, text, textScale }: OracleTextProps) {
  const style = textScale
    ? ({ '--oracle-text-scale': textScale } as CSSProperties)
    : undefined

  return (
    <p className={className} style={style}>
      {text.split(manaTokenPattern).map((part, index) => {
        const symbolKey = part.match(/^\{([^}]+)\}$/)?.[1]
        const symbolAsset = symbolKey && manaSymbols[symbolKey]

        if (symbolAsset && symbolKey) {
          return (
            <img
              alt={`{${symbolKey}}`}
              className="mana-symbol"
              key={`${part}-${index}`}
              src={symbolAsset}
            />
          )
        }

        if (symbolKey) {
          return (
            <span className="mana-token" key={`${part}-${index}`}>
              {symbolKey}
            </span>
          )
        }

        return part
      })}
    </p>
  )
}
import type { CSSProperties } from 'react'
