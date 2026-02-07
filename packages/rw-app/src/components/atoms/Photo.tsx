import { ConditionalDisplay } from './ConditionalDisplay'

interface Props {
  photo?: string | null
}

const Photo = ({ photo }: Props) => {
  return (
    <>
      <ConditionalDisplay visible={Boolean(photo)}>
        {photo ? (
          <div className="w-15 h-15 overflow-hidden rounded-full border-2 border-white shadow-lg">
            <img
              alt="User's display picture"
              className="h-full w-full object-cover"
              src={photo}
            />
          </div>
        ) : null}
      </ConditionalDisplay>

      <ConditionalDisplay visible={!Boolean(photo)}>👤</ConditionalDisplay>
    </>
  )
}

export { Photo }
