import { useEffect, useRef } from 'react'
import { DimOverlay } from '../components/board/GameBoard'
import { CharacterCard } from '../components/CharacterCard'
import { FeedbackForm } from '../components/FeedbackForm'
import { AllocateSheet } from '../components/phone/AllocateSheet'
import { EventSheet } from '../components/phone/EventSheet'
import { PhoneMap, PhoneTracker, PlayersStrip, TopBar } from '../components/phone/PhoneBoard'
import { PhoneMenu } from '../components/phone/PhoneMenu'
import { PhoneStage } from '../components/phone/PhoneStage'
import { CityBankCard } from '../components/popups/ExplorePopups'
import { GameEnd } from '../components/popups/GameEnd'
import { FlyingStars, MetricChangePopup } from '../components/popups/MetricChangePopup'
import { SmallButton } from '../components/SmallButton'
import { roundsUntilReset } from '../data/gameRules'
import { gameSummary } from '../game/debrief'
import { canAfford } from '../game/state'
import { feedbackAvailable } from '../feedback'
import type { GameProps } from './Game'
import { useGameFlow } from './useGameFlow'

// The game board on a phone, or a tablet held upright (Figma "6b · mobile
// hi-fi", M1 to M4). The same game as the desktop board (the steps are in
// useGameFlow.ts), laid out in a column:
//
//   menu · Round 7 of 15 · Token reset in 3
//   score tracker
//   map with the event deck (tap it to draw a card)
//   players strip (swipe sideways; tap a player for their card)
//
// The round's popups are bottom sheets (event card, tokens), and the metric
// popup sits over the tracker so the stars have a short way to fly.
//
// Not on phones yet: explore mode (Figma M5). The end cards are the desktop
// ones, shrunk to fit, until a phone design for them exists.

export function GamePhone({ game, setGame, onLearnMore, onRestart }: GameProps) {
  const flow = useGameFlow(game, setGame)
  const { phase, setPhase, selected, setSelected, popup, setPopup, flights, card, option, over, roundPopup, showEnd } = flow

  // When the stars are about to fly, scroll back up so the tracker is in view
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (phase === 'metrics') scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase])

  const menuItems = [
    { label: 'new game', onClick: () => setPopup({ kind: 'new-game' }) },
    { label: 'learn more', onClick: onLearnMore },
    ...(feedbackAvailable ? [{ label: 'feedback', onClick: () => setPopup({ kind: 'feedback' }) }] : []),
  ]
  const betweenRounds = phase === 'board' && !over

  return (
    <PhoneStage>
      {/* The board: scrolls if the screen is shorter than Figma's 844px */}
      <div ref={scroller} className="absolute inset-0 overflow-x-hidden overflow-y-auto">
        <div className="flex min-h-full flex-col items-center pb-[24px]">
          <div className="w-full">
            <TopBar menu={<PhoneMenu items={menuItems} />} round={game.round} untilReset={over ? undefined : roundsUntilReset(game.round)} />
          </div>
          <div className="mt-[20px]">
            <PhoneTracker metrics={game.metrics} />
          </div>
          <div className="mt-[28px]">
            <PhoneMap onDraw={betweenRounds && card ? () => setPhase('event') : undefined} />
          </div>
          {/* Pushes the players to the bottom on tall screens */}
          <div className="min-h-[32px] flex-1" />
          <PlayersStrip
            players={game.players}
            spent={game.spent}
            onCharacter={betweenRounds ? (id) => setPopup({ kind: 'character', id }) : undefined}
            onCityBank={betweenRounds ? () => setPopup({ kind: 'city-bank' }) : undefined}
          />
        </div>
      </div>

      {/* ---- the round (M2 to M4) ---- */}
      <DimOverlay visible={(roundPopup && !flights) || showEnd} />

      {phase === 'event' && card && (
        <EventSheet
          event={card}
          selected={selected}
          onSelect={setSelected}
          canAfford={(cost) => canAfford(cost, game.players, game.spent)}
          players={game.players}
          onContinue={flow.confirmOption}
        />
      )}

      {phase === 'allocate' && option && <AllocateSheet cost={option.cost} players={game.players} spent={game.spent} onContinue={flow.confirmAllocation} />}

      {phase === 'metrics' && option && (
        // Over the tracker (Figma M4: 330 wide at y 230). The popup is the
        // desktop one at 74%, so it matches it exactly.
        <div className="absolute top-[230px] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-[26px]">
          <div style={{ zoom: 330 / 446 }}>
            <MetricChangePopup effect={option.effect} hidden={!!flights} />
          </div>
          {!flights && (
            <SmallButton width={121} onClick={flow.launchStars}>
              continue
            </SmallButton>
          )}
        </div>
      )}
      {flights && <FlyingStars flights={flights} onLanded={flow.landStars} />}

      {showEnd && (
        // The desktop end cards (630px wide), shrunk to the screen's width
        <div className="absolute top-1/2 left-1/2 z-30" style={{ transform: `translate(-50%, -50%) scale(${358 / 630})` }}>
          <GameEnd game={game} step={flow.endStep} setStep={flow.setEndStep} onRestart={() => setPopup({ kind: 'new-game' })} placed={false} />
        </div>
      )}

      {/* ---- popups: tap outside (or Esc) to close ---- */}
      {popup && (
        <>
          <button type="button" aria-label="Close" onClick={() => setPopup(null)} className="absolute -inset-[10000px] z-30 cursor-default bg-ink-soft/50" />
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-[16px] [&>*]:pointer-events-auto">
            {popup.kind === 'character' && <CharacterCard id={popup.id} side="description" />}
            {popup.kind === 'city-bank' && <CityBankCard className="w-full max-w-[400px] [&_h2]:text-[26px] [&_p]:text-[15px]" />}
            {popup.kind === 'new-game' && <NewGamePhone onRestart={onRestart} onCancel={() => setPopup(null)} />}
            {popup.kind === 'feedback' && (
              <div role="dialog" aria-label="Share feedback" className="w-full max-w-[400px] animate-pop-in rounded-[7px] border border-black bg-cream px-[20px] pt-[20px] pb-[22px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] motion-reduce:animate-none">
                <h2 className="mb-[12px] font-mono text-[24px] leading-none text-ink italic">share feedback</h2>
                <FeedbackForm context={gameSummary(game)} />
              </div>
            )}
          </div>
        </>
      )}
    </PhoneStage>
  )
}

/**
 * "Start a new game?" on a phone: the same blue postcard as on desktop, but
 * standing upright (the picture is portrait already; desktop turns it
 * sideways), with the buttons stacked.
 */
function NewGamePhone({ onRestart, onCancel }: { onRestart: () => void; onCancel: () => void }) {
  return (
    <div role="alertdialog" aria-labelledby="new-game-title" className="relative h-[436px] w-[270px] animate-pop-in drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)] motion-reduce:animate-none">
      <img alt="" src="/assets/player-count-card.svg" className="absolute inset-0 size-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[24px]">
        <p id="new-game-title" className="font-mono text-[22px] text-black italic">
          Start a new game?
        </p>
        <div className="flex flex-col gap-[12px]">
          <SmallButton width={195} onClick={onRestart}>
            restart game
          </SmallButton>
          <SmallButton width={195} onClick={onCancel} autoFocus>
            return to game
          </SmallButton>
        </div>
      </div>
      <img alt="" src="/assets/overview/bird.png" className="absolute right-[26px] bottom-[26px] w-[50px] rotate-[6deg]" />
    </div>
  )
}
