import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export interface MascotModel {
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  eyes: THREE.Group[];
  rest: { head: THREE.Euler; leftArm: THREE.Euler; rightArm: THREE.Euler };
  dispose(): void;
}

/** Small, texture-free toy models. All moving limbs use shoulder-local pivots. */
export function createMascotModel(id: string): MascotModel {
  const known = ["book", "owl", "cat", "fox", "panda", "robot", "turtle", "rabbit", "penguin", "dragon"];
  const character = known.includes(id) ? id : "book";
  const root = new THREE.Group();
  root.name = `mascot-${character}`;
  const head = new THREE.Group();
  head.name = "head";
  const leftArm = new THREE.Group();
  leftArm.name = "left-arm";
  const rightArm = new THREE.Group();
  rightArm.name = "right-arm";
  const eyes: THREE.Group[] = [];
  root.add(head, leftArm, rightArm);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Map<string, THREE.MeshPhysicalMaterial>();
  const geometry = <T extends THREE.BufferGeometry>(value: T): T => { geometries.add(value); return value; };
  const sphereGeometry = geometry(new THREE.SphereGeometry(1, 24, 16));
  const boxGeometry = geometry(new RoundedBoxGeometry(1, 1, 1, 3, 0.16));
  const coneGeometry = geometry(new THREE.ConeGeometry(1, 1, 3, 1));
  function material(color: string, glossy = false): THREE.MeshPhysicalMaterial {
    const key = `${color}:${glossy}`;
    const cached = materials.get(key);
    if (cached) return cached;
    const value = new THREE.MeshPhysicalMaterial({ color, roughness: glossy ? 0.21 : 0.48, metalness: 0, clearcoat: glossy ? 0.5 : 0.2, clearcoatRoughness: 0.4 });
    materials.set(key, value);
    return value;
  }
  function mesh(parent: THREE.Object3D, geo: THREE.BufferGeometry, color: string, position: [number, number, number], scale: [number, number, number], glossy = false): THREE.Mesh {
    const value = new THREE.Mesh(geo, material(color, glossy));
    value.position.set(...position);
    value.scale.set(...scale);
    value.castShadow = true;
    value.receiveShadow = true;
    parent.add(value);
    return value;
  }
  const ball = (parent: THREE.Object3D, color: string, position: [number, number, number], scale: [number, number, number], glossy = false) => mesh(parent, sphereGeometry, color, position, scale, glossy);
  const box = (parent: THREE.Object3D, color: string, position: [number, number, number], scale: [number, number, number], glossy = false) => mesh(parent, boxGeometry, color, position, scale, glossy);
  const cream = "#fff4da", ink = "#152a4c", blue = "#4386f9", navy = "#264b91", peach = "#f69c9e";
  function tube(parent: THREE.Object3D, points: THREE.Vector3[], color: string, radius: number): THREE.Mesh {
    return mesh(parent, geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 16, radius, 6, false)), color, [0, 0, 0], [1, 1, 1]);
  }
  function smile(z: number, y = -0.2, width = 0.14): void {
    tube(head, [new THREE.Vector3(-width, y + 0.055, z), new THREE.Vector3(-width * 0.55, y - 0.015, z + 0.015), new THREE.Vector3(0, y - 0.038, z + 0.018), new THREE.Vector3(width * 0.55, y - 0.015, z + 0.015), new THREE.Vector3(width, y + 0.055, z)], ink, 0.018);
  }
  function eyePair(x: number, y: number, z: number, white = false, size = 1): void {
    for (const side of [-1, 1]) {
      const eye = new THREE.Group();
      eye.name = side < 0 ? "left-eye" : "right-eye";
      eye.position.set(side * x, y, z);
      if (white) ball(eye, "#fffdf8", [0, 0, 0], [0.137 * size, 0.182 * size, 0.068]);
      ball(eye, ink, [side * 0.007, 0, white ? 0.066 : 0], [0.083 * size, 0.119 * size, 0.043], true);
      ball(eye, "#ffffff", [-0.024 * size, 0.044 * size, white ? 0.105 : 0.037], [0.028 * size, 0.036 * size, 0.014], true);
      ball(eye, "#a8d9ff", [0.027 * size, -0.04 * size, white ? 0.105 : 0.037], [0.013 * size, 0.016 * size, 0.008], true);
      head.add(eye);
      eyes.push(eye);
    }
  }
  function cheeks(x: number, y: number, z: number, radius = 0.075): void {
    for (const side of [-1, 1]) ball(head, peach, [side * x, y, z], [radius, radius * 0.62, 0.028]);
  }
  function feet(color: string, width = 0.25): void {
    for (const side of [-1, 1]) ball(root, color, [side * 0.27, 0.125, 0.12], [width, 0.125, 0.31]);
  }
  function arms(color: string, x = 0.5, y = 1.19, wing = false): void {
    for (const [arm, side] of [[leftArm, -1], [rightArm, 1]] as const) {
      arm.position.set(side * x, y, 0);
      arm.rotation.z = side * 0.22;
      ball(arm, color, [side * -0.025, -0.015, 0.015], [0.175, 0.165, 0.155]);
      ball(arm, color, [side * 0.055, -0.25, 0.035], wing ? [0.16, 0.36, 0.14] : [0.14, 0.27, 0.145]);
      if (!wing) ball(arm, color, [side * 0.075, -0.46, 0.045], [0.155, 0.16, 0.155]);
    }
  }
  function scarf(): void {
    const collar = geometry(new THREE.TorusGeometry(0.275, 0.065, 8, 24));
    const band = mesh(root, collar, blue, [0, 1.27, 0], [1.25, 1, 1]);
    band.rotation.x = Math.PI / 2;
    const flap = mesh(root, coneGeometry, blue, [0, 1.075, 0.335], [0.245, 0.26, 0.052]);
    flap.rotation.z = Math.PI;
    flap.rotation.y = Math.PI;
  }
  function roundEar(color: string, inner: string | null, x: number, y: number, z = 0): void {
    for (const side of [-1, 1]) {
      const ear = new THREE.Group();
      ear.name = side < 0 ? "left-ear" : "right-ear";
      ear.position.set(side * x, y, z);
      ball(ear, color, [0, 0, 0], [0.19, 0.23, 0.135]);
      if (inner) ball(ear, inner, [0, 0, 0.11], [0.115, 0.15, 0.035]);
      head.add(ear);
    }
  }
  function pointedEars(color: string, inner: string, x: number, y: number): void {
    for (const side of [-1, 1]) {
      const ear = new THREE.Group();
      ear.name = side < 0 ? "left-ear" : "right-ear";
      ear.position.set(side * x, y, -0.035);
      ear.rotation.z = side * -0.2;
      const outer = mesh(ear, coneGeometry, color, [0, 0, 0], [0.285, 0.43, 0.24]);
      outer.rotation.y = Math.PI;
      const center = mesh(ear, coneGeometry, inner, [0, -0.023, 0.145], [0.175, 0.275, 0.055]);
      center.rotation.y = Math.PI;
      head.add(ear);
    }
  }
  function body(color: string, belly: string | null, width = 0.47, height = 0.61): void {
    ball(root, color, [0, 0.79, 0], [width, height, 0.37]);
    if (belly) ball(root, belly, [0, 0.77, 0.302], [width * 0.73, height * 0.72, 0.106]);
  }
  function headBall(color: string, y = 1.74, width = 0.64, height = 0.59): void {
    head.position.y = y;
    ball(head, color, [0, 0, 0], [width, height, 0.455]);
  }
  function bow(): void {
    for (const side of [-1, 1]) {
      const wing = ball(root, blue, [side * 0.095, 1.225, 0.33], [0.13, 0.08, 0.055]);
      wing.rotation.z = side * -0.3;
    }
    ball(root, "#74b7ff", [0, 1.225, 0.388], [0.055, 0.055, 0.035]);
  }

  if (character === "book") {
    head.position.set(0, 1.39, 0);
    box(head, "#2864d7", [0.035, 0, -0.13], [1.38, 1.72, 0.38]);
    box(head, cream, [0.075, 0, -0.014], [1.29, 1.62, 0.285]);
    box(head, blue, [-0.025, 0.035, 0.16], [1.36, 1.73, 0.205]);
    box(head, "#5d9cfc", [-0.592, 0.035, 0.286], [0.095, 1.52, 0.035]);
    const ringGeometry = geometry(new THREE.TorusGeometry(0.105, 0.028, 8, 16));
    for (const y of [-0.55, -0.28, 0, 0.28, 0.55]) {
      const ring = mesh(head, ringGeometry, "#b2d4ee", [-0.679, y, 0.166], [1, 1, 1], true);
      ring.rotation.y = Math.PI / 2;
    }
    eyePair(0.225, 0.09, 0.285, false, 0.9);
    cheeks(0.355, -0.1, 0.286);
    smile(0.294, -0.17, 0.17);
    arms(blue, 0.7, 1.4);
    for (const side of [-1, 1]) ball(root, navy, [side * 0.27, 0.36, 0.02], [0.115, 0.205, 0.12]);
    feet(navy);
  } else if (character === "owl") {
    body(blue, cream, 0.5, 0.58);
    headBall(blue, 1.77, 0.68, 0.57);
    roundEar(blue, null, 0.49, 0.46, -0.025);
    ball(head, cream, [0, -0.13, 0.326], [0.37, 0.3, 0.16]);
    for (const side of [-1, 1]) ball(head, cream, [side * 0.235, 0.025, 0.334], [0.305, 0.38, 0.145]);
    eyePair(0.255, 0.075, 0.489, false, 1.02);
    const beak = ball(head, "#f5b947", [0, -0.105, 0.517], [0.106, 0.105, 0.09]);
    beak.rotation.x = -0.35;
    cheeks(0.405, -0.105, 0.414);
    for (const y of [0.67, 0.87, 1.06]) for (const x of [-0.13, 0.13]) {
      const feather = ball(root, "#f3e6c7", [x, y, 0.407], [0.108, 0.041, 0.018]);
      feather.rotation.z = x < 0 ? -0.22 : 0.22;
    }
    arms(blue, 0.5, 1.2, true);
    feet("#f3b147", 0.22);
  } else if (character === "cat" || character === "fox") {
    const fox = character === "fox";
    const fur = fox ? "#f78038" : "#ffe6b7";
    body(fur, cream);
    headBall(fur, 1.73, 0.63, 0.55);
    pointedEars(fox ? "#f77b31" : "#f9c075", fox ? cream : "#f5b3a3", 0.43, 0.47);
    if (!fox) {
      const patch = ball(head, "#f5b05d", [0.292, 0.223, 0.265], [0.263, 0.327, 0.195]);
      patch.rotation.z = -0.28;
      for (const x of [-0.075, 0.065, 0.195]) {
        const stripe = ball(head, "#da923e", [x, 0.412, 0.237], [0.023, 0.1, 0.019]);
        stripe.rotation.z = -0.12;
      }
    }
    for (const side of [-1, 1]) ball(head, cream, [side * 0.205, -0.193, 0.362], [0.288, 0.226, 0.113]);
    eyePair(0.237, 0.035, 0.435, false, 0.91);
    ball(head, fox ? ink : "#dc977b", [0, -0.105, 0.506], [0.072, 0.052, 0.046], true);
    smile(0.484, -0.245, 0.095);
    cheeks(0.39, -0.12, 0.408, 0.063);
    if (!fox) for (const side of [-1, 1]) for (const y of [-0.095, -0.175]) {
      tube(head, [new THREE.Vector3(side * 0.35, y, 0.434), new THREE.Vector3(side * 0.51, y - 0.018, 0.399)], "#ae8253", 0.011);
    }
    scarf();
    arms(fur);
    feet(fox ? "#bd522c" : fur);
    const tail = new THREE.Group();
    tail.name = "tail";
    tail.position.set(0.36, 0.6, -0.2);
    tail.rotation.z = -0.45;
    ball(tail, fur, [0.28, 0.02, -0.07], [fox ? 0.25 : 0.13, fox ? 0.45 : 0.4, 0.19]);
    ball(tail, cream, [0.33, 0.335, -0.06], [fox ? 0.23 : 0.13, 0.16, 0.185]);
    root.add(tail);
  } else if (character === "panda") {
    body(cream, null, 0.49);
    headBall(cream, 1.76, 0.65, 0.575);
    roundEar(ink, null, 0.46, 0.46, -0.05);
    for (const side of [-1, 1]) {
      const patch = ball(head, ink, [side * 0.265, -0.003, 0.392], [0.201, 0.245, 0.073]);
      patch.rotation.z = side * 0.27;
    }
    eyePair(0.265, 0.016, 0.471, true, 0.66);
    ball(head, ink, [0, -0.171, 0.465], [0.065, 0.045, 0.035], true);
    smile(0.461, -0.27, 0.09);
    cheeks(0.418, -0.172, 0.376, 0.061);
    scarf();
    arms(ink);
    feet(ink);
  } else if (character === "robot") {
    box(root, "#65b7f9", [0, 0.8, 0], [0.9, 1.08, 0.66]);
    box(root, "#2673d2", [0, 0.875, 0.346], [0.43, 0.18, 0.055]);
    box(root, "#b3e8ff", [0, 1.1, 0.344], [0.12, 0.04, 0.06], true);
    head.position.y = 1.8;
    box(head, blue, [0, 0, 0], [1.35, 1.07, 0.88]);
    box(head, "#97d8ff", [0, -0.012, 0.404], [1.15, 0.91, 0.11]);
    box(head, cream, [0, -0.012, 0.477], [1.055, 0.817, 0.11]);
    eyePair(0.25, 0.02, 0.537, false, 0.94);
    smile(0.538, -0.24, 0.14);
    cheeks(0.39, -0.12, 0.541, 0.071);
    const aerial = new THREE.Group();
    aerial.name = "antenna";
    ball(aerial, navy, [0, 0.62, 0], [0.043, 0.14, 0.043]);
    ball(aerial, "#59b4fb", [0, 0.755, 0], [0.12, 0.12, 0.12], true);
    head.add(aerial);
    for (const side of [-1, 1]) ball(head, "#60b8fb", [side * 0.697, 0, -0.025], [0.07, 0.17, 0.15]);
    arms("#59aaf3", 0.51, 1.2);
    for (const arm of [leftArm, rightArm]) {
      ball(arm, "#2372cb", [0, -0.31, 0.04], [0.155, 0.055, 0.157]);
      for (const x of [-0.06, 0.04]) ball(arm, "#81cdff", [x, -0.515, 0.108], [0.039, 0.085, 0.039]);
    }
    feet("#2674d2");
  } else if (character === "turtle") {
    const green = "#86c97b";
    body(green, cream, 0.45, 0.59);
    ball(root, "#42884f", [0, 0.87, -0.21], [0.56, 0.64, 0.29]);
    ball(root, "#69a85d", [0, 0.9, -0.365], [0.49, 0.56, 0.18]);
    for (const y of [0.57, 0.75, 0.94]) ball(root, "#e9dfb9", [0, y, 0.414], [0.295, 0.016, 0.009]);
    headBall(green, 1.77, 0.635, 0.59);
    eyePair(0.265, 0.035, 0.434, false, 0.96);
    smile(0.47, -0.221, 0.17);
    cheeks(0.412, -0.12, 0.378, 0.07);
    arms(green);
    feet(green);
    for (const side of [-1, 1]) {
      for (const x of [-0.075, 0.005, 0.085]) ball(root, "#c1e1a5", [side * 0.27 + x, 0.085, 0.401], [0.029, 0.026, 0.048]);
      for (const y of [-0.2, -0.32]) ball(side < 0 ? leftArm : rightArm, "#5fab64", [side * 0.075, y, 0.18], [0.034, 0.04, 0.015]);
    }
  } else if (character === "rabbit") {
    const lilac = "#b797ed";
    body(lilac, cream, 0.43, 0.5);
    headBall(lilac, 1.45, 0.57, 0.5);
    for (const side of [-1, 1]) {
      const ear = new THREE.Group();
      ear.name = side < 0 ? "left-ear" : "right-ear";
      ear.position.set(side * 0.265, 0.52, -0.045);
      ear.rotation.z = side * -0.15;
      ball(ear, lilac, [0, 0.21, 0], [0.146, 0.395, 0.115]);
      ball(ear, "#efbedc", [0, 0.235, 0.101], [0.089, 0.295, 0.032]);
      head.add(ear);
    }
    eyePair(0.217, 0.005, 0.425, false, 0.87);
    ball(head, "#e496b7", [0, -0.123, 0.467], [0.052, 0.045, 0.032]);
    smile(0.459, -0.218, 0.1);
    cheeks(0.351, -0.131, 0.362, 0.06);
    arms(lilac, 0.47, 1.025);
    feet(lilac, 0.24);
    ball(root, cream, [0.4, 0.495, -0.255], [0.18, 0.18, 0.18]);
  } else if (character === "penguin") {
    body(navy, cream, 0.54, 0.65);
    headBall(navy, 1.71, 0.64, 0.58);
    ball(head, cream, [0, -0.165, 0.319], [0.36, 0.285, 0.163]);
    for (const side of [-1, 1]) ball(head, cream, [side * 0.215, -0.045, 0.327], [0.297, 0.376, 0.16]);
    eyePair(0.242, 0.022, 0.487, false, 0.94);
    ball(head, "#f6ae3d", [0, -0.123, 0.525], [0.111, 0.072, 0.103]);
    cheeks(0.391, -0.151, 0.402, 0.056);
    for (const x of [-0.065, 0.065]) {
      const tuft = ball(head, navy, [x, 0.55, -0.025], [0.066, 0.12, 0.085]);
      tuft.rotation.z = -0.3;
    }
    arms(navy, 0.54, 1.24, true);
    feet("#eea437", 0.235);
    bow();
  } else {
    const mint = "#62c6b1";
    body(mint, cream, 0.46, 0.57);
    headBall(mint, 1.74, 0.63, 0.57);
    for (const side of [-1, 1]) {
      const horn = ball(head, cream, [side * 0.37, 0.535, -0.034], [0.09, 0.195, 0.09]);
      horn.rotation.z = side * -0.25;
      const ear = ball(head, mint, [side * 0.606, 0.005, -0.12], [0.13, 0.2, 0.12]);
      ear.rotation.z = side * -0.4;
      const wing = new THREE.Group();
      wing.name = side < 0 ? "left-wing" : "right-wing";
      wing.position.set(side * 0.44, 1.06, -0.19);
      wing.rotation.z = side * -0.3;
      ball(wing, "#399f91", [side * 0.125, 0, 0], [0.23, 0.37, 0.045]);
      ball(wing, "#efa26f", [side * 0.151, -0.018, 0.042], [0.168, 0.294, 0.025]);
      root.add(wing);
    }
    for (const y of [0.48, 0.36]) ball(head, "#389d91", [0, y, -0.26], [0.09, 0.1, 0.13]);
    eyePair(0.237, 0.036, 0.433, false, 0.93);
    ball(head, "#80d5bc", [0, -0.17, 0.407], [0.29, 0.169, 0.1]);
    for (const side of [-1, 1]) ball(head, "#338f7f", [side * 0.085, -0.106, 0.499], [0.021, 0.014, 0.009]);
    smile(0.511, -0.241, 0.12);
    cheeks(0.399, -0.131, 0.378, 0.065);
    arms(mint);
    feet(mint);
    const tail = new THREE.Group();
    tail.name = "tail";
    tail.position.set(0.33, 0.485, -0.27);
    tube(tail, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2, -0.03, -0.02), new THREE.Vector3(0.38, 0.04, 0), new THREE.Vector3(0.42, 0.26, 0.03)], mint, 0.09);
    ball(tail, cream, [0.42, 0.282, 0.026], [0.078, 0.11, 0.066]);
    root.add(tail);
  }

  // Keep all ten friends the same practical size, including rabbit ears and antennae.
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const scale = 2.5 / (bounds.max.y - bounds.min.y);
  root.scale.setScalar(scale);
  root.position.y = -bounds.min.y * scale;
  const rest = { head: head.rotation.clone(), leftArm: leftArm.rotation.clone(), rightArm: rightArm.rotation.clone() };
  let disposed = false;
  return {
    root, head, leftArm, rightArm, eyes, rest,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const value of geometries) value.dispose();
      for (const value of materials.values()) value.dispose();
      root.clear();
    }
  };
}
