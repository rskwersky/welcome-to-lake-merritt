// The small "greetings from Lake Merritt" postcard drawing, standing upright
// (portrait). It fills whatever box it's put in: every piece is placed in %
// of the card, or in container query units (cqw/cqh), as Figma exports it.
// Used lying on the board on the game overview, and as the event deck.

const A = '/assets/overview'

export function MiniPostcard({ textClass = 'text-[12px]' }: { textClass?: string }) {
  return (
    <div className="relative size-full">
      <div className="absolute inset-[1.92%_3.1%]">
        <img alt="" src={`${A}/postcard-blue.svg`} className="absolute inset-0 block size-full max-w-none" />
      </div>
      <div className="absolute inset-[0.27%_0.44%]">
        <img alt="" src={`${A}/postcard-inner-stroke.svg`} className="absolute inset-0 block size-full max-w-none" />
      </div>
      <img alt="" src={`${A}/postcard-rectangle.svg`} className="absolute inset-0 block size-full max-w-none" />

      <div className="absolute inset-[6.36%_9.32%_10.73%_2.95%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="h-[hypot(68.4886cqw,-10.3522cqh)] w-[hypot(-31.5114cqw,-89.6478cqh)] flex-none rotate-[-103.03deg] skew-x-[-0.11deg]">
          <div className="pointer-events-none relative size-full overflow-hidden">
            <img alt="" src={`${A}/merritt.png`} className="absolute top-0 left-0 h-[127.47%] w-full max-w-none" />
          </div>
        </div>
      </div>
      <div className="absolute inset-[42.32%_26.59%_4.27%_8.12%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="h-[hypot(73.4738cqw,-12.8285cqh)] w-[hypot(-26.5262cqw,-87.1715cqh)] flex-none rotate-[-103.03deg] skew-x-[-0.11deg]">
          <img alt="" src={`${A}/lake.png`} className="pointer-events-none size-full max-w-none" />
        </div>
      </div>
      {/* canoe */}
      <div className="absolute inset-[38.8%_67.68%_51.24%_23.12%]">
        <img alt="" src={`${A}/canoe-1.svg`} className="absolute inset-0 block size-full max-w-none" />
      </div>
      <div className="absolute inset-[30.19%_72.9%_61.93%_15.64%]">
        <img alt="" src={`${A}/canoe-2.svg`} className="absolute inset-0 block size-full max-w-none" />
      </div>
      <div className="absolute inset-[30.77%_67.16%_50.85%_14.98%]">
        <img alt="" src={`${A}/canoe-3.svg`} className="absolute inset-0 block size-full max-w-none" />
      </div>
      <div className="absolute inset-[38.31%_71.86%_60.77%_24.33%]">
        <img alt="" src={`${A}/canoe-4.svg`} className="absolute inset-0 block size-full max-w-none" />
      </div>
      {/* pelican */}
      <div className="absolute inset-[14.37%_18.13%_64.56%_60.97%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="h-[hypot(83.2357cqw,5.5863cqh)] w-[hypot(16.7643cqw,-94.4137cqh)] flex-none rotate-[-83.74deg] skew-x-[0.05deg]">
          <img alt="" src={`${A}/bird.png`} className="pointer-events-none size-full max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[54.53%_58.68%_7.49%_8.3%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="h-[hypot(33.8152cqw,-6.98104cqh)] w-[hypot(-66.1848cqw,-93.019cqh)] flex-none rotate-[-111.05deg] skew-x-[-0.16deg]">
          <p className={`relative size-full font-script leading-[0.94] text-ink ${textClass}`}>greetings from</p>
        </div>
      </div>
    </div>
  )
}
