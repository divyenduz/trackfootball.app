import Button from 'components/atoms/Button'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="hero-landing">
        <div className="hero-image">
          <img
            alt="stats"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            src="/assets/core/landing/images/hero_intro.jpg"
          ></img>
        </div>
        <div className="overlay" />
        <div className="content-wrapper">
          <div className="title-line" />
          <div className="title">Improve Your Game</div>
          <p className="copy">
            TrackFootball is a social network for casual Football players. Play
            football and record your game with any GPS watch/phone and upload it
            to TrackFootball.
          </p>
          <Link href="/api/auth/login">
            <Button variant="contained">Get started now</Button>
          </Link>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stats">
          <div className="stat-icon">
            <img
              style={{ width: '60%' }}
              alt="stat icon analyse"
              src="/assets/core/landing/images/stat_icons/analyse.svg"
            ></img>
          </div>
          <span>Track, Analyse and Improve Your Game</span>
        </div>
        <div className="stats">
          <div className="stat-icon">
            <img
              style={{ width: '60%' }}
              alt="stat icon compete"
              src="/assets/core/landing/images/stat_icons/compare.svg"
            ></img>
          </div>
          <span>Compete with Your Friends</span>
        </div>
        <div className="stat icon overview">
          <div className="stat-icon">
            <img
              className="w-full"
              alt="stat icon overview"
              src="/assets/core/landing/images/stat_icons/overview.svg"
            ></img>
          </div>
          <span>Get Overview of Progress</span>
        </div>
        <div className="stat icon social media">
          <div className="stat-icon">
            <img
              style={{ width: '80%' }}
              alt="stat icon share"
              src="/assets/core/landing/images/stat_icons/share.svg"
            ></img>
          </div>
          <span>Share on Social Media</span>
        </div>
      </div>

      <div className="hero-landing">
        <div className="hero-image" style={{ filter: 'none' }}>
          <img
            alt="stats"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            src="/assets/core/landing/images/hero_club.jpg"
          ></img>
        </div>
        <div className="overlay" style={{ mixBlendMode: 'multiply' }} />
        <div
          className="content-wrapper"
          style={{
            width: 900,
            maxWidth: '70vw',
            margin: 'auto',
            position: 'relative',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            right: 0,
            top: 0,
            height: '100%',
          }}
        >
          <div>
            <div className="title" style={{ fontWeight: 200 }}>
              Brought by Football Berlin
            </div>
            <p className="copy" style={{ fontWeight: 300 }}>
              Local football comunity with ~100 diverse nationalities dedicated
              to helping players improve their game. You don&apos;t need to play
              for a club to get meaningful stats for your game.
            </p>
          </div>
          <Link href="/api/auth/login">
            <Button variant="contained">Get started now</Button>
          </Link>
        </div>
      </div>
    </>
  )
}
