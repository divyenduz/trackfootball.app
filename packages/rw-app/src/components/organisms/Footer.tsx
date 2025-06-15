import Logo from '@/components/atoms/brand/core/Logo'

export function Footer() {
  return (
    <div className="p-5 bg-oynx">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-8 cursor-pointer ">
          <div className="flex items-center justify-center">
            <Logo size={'xs'} />
            {/* <Typography
              variant="h6"
              component={'h5'}
              className="hidden md:block"
              style={{
                color: '#fff',
                fontWeight: 300,
                position: 'relative',
              }}
            >
              TrackFootball
            </Typography> */}
          </div>
          <span className="flex items-center justify-center text-sm font-light text-center text-gray-300">
            Made for players looking to improve their games
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white underline dec">
          <a href="/privacy" target="_blank">
            <span className="text-gray-500">Privacy Policy</span>
          </a>
          <a href="mailto:hello@trackfootball.app" target="_blank">
            <span className="text-gray-500">Contact Us</span>
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center m-4">
          <img
            width={100}
            height={50}
            alt="Compatible with Strava logo"
            src="/assets/strava/api_logo_cptblWith_strava_stack_white.svg"
          ></img>
        </div>
      </div>
    </div>
  )
}
