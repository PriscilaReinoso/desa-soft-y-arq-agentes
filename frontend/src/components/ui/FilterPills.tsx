export type FilterOption = { value: string; label: string }

type Props = {
  options: (string | FilterOption)[]
  active: string
  onChange: (value: string) => void
}

export default function FilterPills({ options, active, onChange }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value
        const label = typeof option === 'string' ? option : option.label
        const isActive = value === active
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`px-[14px] py-[7px] rounded-full text-xs font-semibold cursor-pointer ${
              isActive
                ? 'border-[1.5px] border-primary bg-primary text-white'
                : 'border border-border bg-card text-foreground'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
