type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'rounded px-3 py-1 text-sm text-white cursor-pointer'
  const variants = {
    primary: 'bg-[indianred] hover:bg-[#c45a5a]',
    secondary: 'bg-gray-600 hover:bg-gray-700',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
