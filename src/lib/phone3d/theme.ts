/*
 * Colours for everything printed in 3D (cards, folder pages, the calendar).
 * Draw functions read T at draw time, so switching day/night just swaps the
 * values and asks every registered card to repaint.
 */
const DAY = {
  night: false,
  paper: '#F7F0F2', // card face: frosted, like a phone notification
  paperAlt: '#ECE2E6', // inset blocks, chips
  ink: '#474329', // main text
  body: '#5F5943', // body text
  mute: '#6E6850', // small labels
  edge: '#E9DDE2', // card rim (soft, close to the face)
  line: '#eadccb', // dividers
  skeleton: '#d9cbb8', // placeholder lines
  bubble: '#FFFFFF', // chat bubble from the client
  okBg: '#EEF4E8',
  okInk: '#5E8E4D',
  stopBg: '#FDE7EE',
  blush: '#FBE3EC',
  blushEdge: '#f2c3d6',
  accentInk: '#B0245F', // pink text on a light card
  photoBg: '#d8c9b4',
  polaroid: '#ffffff',
  stand: '#E8DCCB',
  page: '#FFFDF9', // folder screenshot page
  pageInk: '#474329',
  pageBody: '#5F5943',
  sheet: '#fbf8f2', // loose papers in folders
  sheetAlt: '#f1ebe0',
};
const NIGHT: typeof DAY = {
  night: true,
  paper: '#3a2233',
  paperAlt: '#4a2c42',
  ink: '#ffeaf4',
  body: '#f1d3e2',
  mute: '#d9a9c2',
  edge: '#4a2c42',
  line: '#4f3048',
  skeleton: '#5a2f50',
  bubble: '#3a1a34',
  okBg: '#21301f',
  okInk: '#8fd1a8',
  stopBg: '#4a1838',
  blush: '#4a1838',
  blushEdge: '#6a2a55',
  accentInk: '#ff8fbd',
  photoBg: '#4a2440',
  polaroid: '#3a1a34',
  stand: '#3a1a34',
  page: '#2d1428',
  pageInk: '#ffeaf4',
  pageBody: '#e8bcd2',
  sheet: '#3a1a34',
  sheetAlt: '#2d1428',
};

export const T = { ...DAY };
const listeners = new Set<() => void>();
export const onTheme = (f: () => void) => {
  listeners.add(f);
};
export function setTheme(night: boolean) {
  if (T.night === night) return;
  Object.assign(T, night ? NIGHT : DAY);
  listeners.forEach((f) => f());
}
