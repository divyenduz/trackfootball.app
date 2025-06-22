import { Avatar } from '@mui/material'
import { ConditionalDisplay } from './ConditionalDisplay'

interface Props {
  photo?: string | null
}

const Photo = ({ photo }: Props) => {
  return (
    <>
      <ConditionalDisplay visible={Boolean(photo)}>
        {photo ? (
          <Avatar className="w-15 h-15 border-2 border-white shadow-lg">
            <img
              alt="User's display picture"
              width={40}
              height={40}
              className="object-cover rounded-full"
              src={photo}
            ></img>
          </Avatar>
        ) : null}
      </ConditionalDisplay>

      <ConditionalDisplay visible={!Boolean(photo)}>👤</ConditionalDisplay>
    </>
  )
}

export { Photo }
