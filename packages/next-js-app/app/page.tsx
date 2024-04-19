import Image from 'next/image'
import Link from 'next/link'

import { Button } from '../components/atoms/Button'

export default function Home() {
  return (
    <>
      <div className="hero-landing">
        <div className="hero-image">
          <Image
            alt="stats"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            src="/assets/core/landing/images/hero_intro.jpg"
          ></Image>
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
            <Image
              style={{ width: '60%' }}
              alt="stat icon analyse"
              src="/assets/core/landing/images/stat_icons/analyse.svg"
            ></Image>
          </div>
          <span>Track, Analyse and Improve Your Game</span>
        </div>
        <div className="stats">
          <div className="stat-icon">
            <Image
              style={{ width: '60%' }}
              alt="stat icon compete"
              src="/assets/core/landing/images/stat_icons/compare.svg"
            ></Image>
          </div>
          <span>Compete with Your Friends</span>
        </div>
        <div className="stat icon overview">
          <div className="stat-icon">
            <Image
              className="w-full"
              alt="stat icon overview"
              src="/assets/core/landing/images/stat_icons/overview.svg"
            ></Image>
          </div>
          <span>Get Overview of Progress</span>
        </div>
        <div className="stat icon social media">
          <div className="stat-icon">
            <Image
              style={{ width: '80%' }}
              alt="stat icon share"
              src="/assets/core/landing/images/stat_icons/share.svg"
            ></Image>
          </div>
          <span>Share on Social Media</span>
        </div>
      </div>

      <div className="hero-landing">
        <div className="hero-image" style={{ filter: 'none' }}>
          <Image
            alt="stats"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            src="/assets/core/landing/images/hero_club.jpg"
          ></Image>
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
