interface ToggleSwitchProps {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
  id?: string
}

export default function ToggleSwitch({ checked, onChange, disabled, id }: ToggleSwitchProps) {
  return (
    <label className="settings-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="settings-toggle__track" />
      <span className="settings-toggle__thumb" />
    </label>
  )
}
