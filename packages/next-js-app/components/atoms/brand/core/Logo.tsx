type Size = 'xs'

interface Props {
  size?: Size
}

export const Logo = ({ size }: Props) => {
  const sizePxMap: { [key in Size]: number } = {
    xs: 50,
  }
  const sizePx = sizePxMap[size ?? 'xs']
  return (
    <>
      <img
        alt="Logo of trackfootball.app"
        src="/assets/core/track-football.svg"
        height={sizePx}
        width={sizePx}
      />
    </>
  )
}

export default Logo
