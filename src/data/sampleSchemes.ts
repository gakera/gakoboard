export type SampleScheme = {
  id: string
  name: string
  kind: 'One-shot' | 'Ongoing'
  reminder: string
}

// Placeholder-only examples. Real card metadata will be imported in a later pass.
export const placeholderSchemes: SampleScheme[] = [
  {
    id: 'clockwork-eclipse',
    name: 'Clockwork Eclipse',
    kind: 'One-shot',
    reminder: 'Each opponent pauses as the board shifts beneath them.',
  },
  {
    id: 'echoing-decree',
    name: 'Echoing Decree',
    kind: 'Ongoing',
    reminder: 'A strange decree remains face up and changes the next turn.',
  },
  {
    id: 'vault-of-whispered-dice',
    name: 'Vault of Whispered Dice',
    kind: 'Ongoing',
    reminder: 'The vault hums until the scheme is abandoned.',
  },
]
