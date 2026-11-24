import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { roundedShape } from './kit';

/*
 * The phone: a modern flat-edged smartphone. A thin light-titanium frame,
 * a flat black glass front with a slim even border, a rounded screen that
 * takes the live canvas texture, a Dynamic Island pill, low metal side
 * buttons and a camera plateau on the back (seen when it turns).
 * The screen is sized to the canvas's aspect (512 x 1085) so nothing stretches.
 */
const SCREEN_ASPECT = 512 / 1085;
export const SCREEN_H = 5.2;
export const SCREEN_W = SCREEN_H * SCREEN_ASPECT;
const BORDER = 0.1;
export const PHONE = { w: SCREEN_W + BORDER * 2, h: SCREEN_H + BORDER * 2, d: 0.3 };

export function buildPhone(screenTex: THREE.Texture) {
  const { w: W, h: H, d: D } = PHONE;
  const R = 0.42; // corner radius
  const group = new THREE.Group();

  // titanium frame (the "case" material, tinted for night mode by the world)
  const caseMat = new THREE.MeshStandardMaterial({ color: '#ecebe8', metalness: 0.45, roughness: 0.3, envMapIntensity: 1.1 });
  // an extruded rounded rectangle, so the corners follow the same curve as the
  // glass (a rounded box can't: its radius is capped by the thin depth), with
  // softly rounded side edges
  const eb = 0.07, et = 0.09;
  const frameGeo = new THREE.ExtrudeGeometry(roundedShape(W - eb * 2, H - eb * 2, R - eb), { depth: D - et * 2, bevelEnabled: true, bevelThickness: et, bevelSize: eb, bevelSegments: 5, curveSegments: 18 });
  frameGeo.translate(0, 0, -(D - et * 2) / 2);
  const frame = new THREE.Mesh(frameGeo, caseMat);
  group.add(frame);

  // flat black glass front, a hair proud of the frame
  const glassMat = new THREE.MeshStandardMaterial({ color: '#07070a', metalness: 0.1, roughness: 0.12, envMapIntensity: 0.6 });
  const glassGeo = new THREE.ExtrudeGeometry(roundedShape(W - 0.05, H - 0.05, R - 0.03), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 14 });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.z = D / 2 - 0.012;
  group.add(glass);

  // the screen: rounded like the glass, mapped edge to edge
  const sw = SCREEN_W, sh = SCREEN_H;
  const screenGeo = new THREE.ShapeGeometry(roundedShape(sw, sh, R - BORDER + 0.02), 14);
  const pos = screenGeo.attributes.position as THREE.BufferAttribute;
  const uv = screenGeo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + sw / 2) / sw, (pos.getY(i) + sh / 2) / sh);
  const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.position.z = D / 2 + 0.02;
  group.add(screen);

  // Dynamic Island
  const islandGeo = new THREE.ShapeGeometry(roundedShape(0.78, 0.23, 0.115), 12);
  const island = new THREE.Mesh(islandGeo, new THREE.MeshBasicMaterial({ color: '#000000' }));
  island.position.set(0, sh / 2 - 0.26, D / 2 + 0.024);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), new THREE.MeshBasicMaterial({ color: '#1c2233' }));
  lens.position.set(0.24, sh / 2 - 0.26, D / 2 + 0.026);
  group.add(island, lens);

  // low metal buttons: action + volume on the left, power on the right
  const btnMat = new THREE.MeshStandardMaterial({ color: '#dddbd7', metalness: 0.5, roughness: 0.3 });
  const button = (len: number, x: number, y: number) => {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, len, 4, 10), btnMat);
    b.position.set(x, y, 0);
    group.add(b);
  };
  button(0.18, -W / 2 - 0.012, 1.75);
  button(0.42, -W / 2 - 0.012, 1.1);
  button(0.42, -W / 2 - 0.012, 0.45);
  button(0.62, W / 2 + 0.012, 1.0);

  // camera plateau on the back
  const back = new THREE.Group();
  const plateauMat = new THREE.MeshStandardMaterial({ color: '#e2e0dc', metalness: 0.3, roughness: 0.35 });
  const plateau = new THREE.Mesh(new RoundedBoxGeometry(1.05, 1.05, 0.06, 4, 0.03), plateauMat);
  back.add(plateau);
  const lensMat = new THREE.MeshStandardMaterial({ color: '#15161c', metalness: 0.2, roughness: 0.1 });
  const ringMat = new THREE.MeshStandardMaterial({ color: '#c9c7c3', metalness: 0.7, roughness: 0.25 });
  for (const [x, y] of [[-0.24, 0.24], [-0.24, -0.24], [0.24, 0]]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, -0.04);
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), lensMat);
    l.position.set(x, y, -0.066);
    l.rotation.y = Math.PI;
    back.add(ring, l);
  }
  back.position.set(-W / 2 + 0.72, H / 2 - 0.72, -D / 2 - 0.02);
  group.add(back);

  const setEnv = (env: THREE.Texture) => {
    for (const m of [caseMat, glassMat, btnMat, ringMat]) {
      m.envMap = env;
      m.needsUpdate = true;
    }
    caseMat.metalness = 0.85; // with reflections to show, it can be properly metal
  };
  // night: graphite titanium instead of the light frame
  const setNight = (night: boolean) => {
    caseMat.color.set(night ? '#4a4247' : '#ecebe8');
    btnMat.color.set(night ? '#3e373b' : '#dddbd7');
    plateauMat.color.set(night ? '#3e373b' : '#e2e0dc');
    ringMat.color.set(night ? '#5a5257' : '#c9c7c3');
  };
  return { group, caseMat, setEnv, setNight };
}
