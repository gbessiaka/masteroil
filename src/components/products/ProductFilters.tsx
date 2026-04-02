'use client'

interface FiltersProps {
  selected: string
  onChange: (cat: string) => void
}

const categories = [
  { value: 'all', label: 'Tous les produits' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'industriel', label: 'Industriel' },
]

export default function ProductFilters({ selected, onChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            selected === c.value
              ? 'bg-brand-gold text-brand-black'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
