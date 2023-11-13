// https://developers.strava.com/guidelines/

interface Props {
  callbackUrl: string
}

export const ConnectWithStrava: React.FC<Props> = ({ callbackUrl }) => {
  const clientId = '17984'
  const scope =
    'activity:read,activity:read_all' as 'activity:read_all,activity:read_all'
  return (
    <div>
      <a
        href={`https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&approval_prompt=auto&scope=${scope}`}
      >
        <img
          alt="Connect with Strava button"
          src="/assets/strava/connect-with-strava.png"
          width={200}
          height={50}
        ></img>
      </a>
    </div>
  )
}

export default ConnectWithStrava
