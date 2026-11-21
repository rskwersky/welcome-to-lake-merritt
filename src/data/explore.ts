// Explore mode: what each map star shows when clicked (Figma "10 explore /
// star – …"). A photo of the real place and a caption. Photos are in
// public/assets/explore/, cropped exactly as framed in Figma.

export type MapStarId = 'pergola' | 'boating-center' | 'lake-shore-ave' | 'bird-sanctuary' | 'corner' | 'lake'

export const STAR_PHOTOS: Record<MapStarId, { photo: string; caption: string }> = {
  pergola: {
    photo: '/assets/explore/pergola.jpg',
    caption: 'The Lake Merritt Pergola. Built in 1913 and restored in 2006. Home to Lake Merritt’s drum circle, which takes place on Saturdays from 3pm to 8pm.',
  },
  'boating-center': {
    photo: '/assets/explore/boating-center.jpg',
    caption: 'The Lake Merritt Sailboat House. Join a rowing club, learn to sail, or just enjoy the views from here.',
  },
  'lake-shore-ave': {
    photo: '/assets/explore/lake-shore-ave.jpg',
    caption: 'Lakeshore Ave, originally called First Ave. Populated with apartments with beautiful lakeside views.',
  },
  'bird-sanctuary': {
    photo: '/assets/explore/bird-sanctuary.jpg',
    caption: 'Lake Merritt is home to over 100 different types of birds. It’s a treasured spot for local ornithologists.',
  },
  corner: {
    photo: '/assets/explore/corner.jpg',
    caption: 'The NW side of Lake Merritt. See the Necklace of Lights, the jewel of Lake Merritt’s shoreline.',
  },
  lake: {
    photo: '/assets/explore/lake.jpg',
    caption: 'The lake is beautiful from every angle, beloved by all from boaters, runners, kayakers, strollers, and birds.',
  },
}
