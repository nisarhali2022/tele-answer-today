import AdImage from './AdImage'

// 160x600 rails beside the 1280px (max-w-7xl) content column. They are hidden
// (display: none) below 1660px, so the lazy units never load on smaller screens.
const RAIL_OFFSET = 'calc(50% - 640px - 180px)'

export default function SideRailAds() {
  return (
    <>
      <div
        className="fixed top-28 z-10 hidden min-[1660px]:block"
        style={{ left: RAIL_OFFSET }}
      >
        <AdImage width={160} height={600} />
      </div>
      <div
        className="fixed top-28 z-10 hidden min-[1660px]:block"
        style={{ right: RAIL_OFFSET }}
      >
        <AdImage width={160} height={600} />
      </div>
    </>
  )
}
