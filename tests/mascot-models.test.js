const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");
const THREE = require("three");

const IDS = ["book", "owl", "cat", "fox", "panda", "robot", "turtle", "rabbit", "penguin", "dragon"];
let createMascotModel, createMascotCamera, mascotPose;

function runtime(file, names, globals = {}) {
  const source = fs.readFileSync(path.resolve(__dirname, "../src/ui", file), "utf8");
  const javascript = stripTypeScriptTypes(source.replace(/^import[^\n]*\n/gm, ""), { mode: "strip" }).replace(/^export /gm, "");
  return vm.runInNewContext(javascript + `\n({${names.join(",")}})`, globals, { filename: file });
}

test.before(async () => {
  const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
  ({ createMascotModel } = runtime("mascot-models.ts", ["createMascotModel"], { THREE, RoundedBoxGeometry }));
  const motion = runtime("mascot-motion.ts", ["mascotPose", "idleActivity", "CELEBRATION_SECONDS", "GREETING_SECONDS"]);
  ({ mascotPose } = motion);
  ({ createMascotCamera } = runtime("mascot-scene.ts", ["createMascotCamera"], { THREE, createMascotModel, ...motion }));
});

test("all ten mascots have finite normalized geometry and independent eyes and shoulder pivots", () => {
  for (const id of IDS) {
    const model = createMascotModel(id);
    try {
      model.root.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model.root);
      assert.ok(Math.abs(bounds.min.y) < 1e-6, `${id}: feet reach the floor`);
      assert.ok(Math.abs(bounds.max.y - 2.5) < 1e-6, `${id}: ears and antenna fit the common height`);
      assert.ok(bounds.max.x > bounds.min.x && bounds.max.z > bounds.min.z, `${id}: actual volume`);
      assert.equal(model.root.name, `mascot-${id}`);
      for (const part of [model.head, model.leftArm, model.rightArm]) {
        assert.equal(part.parent, model.root, `${id}: independent animation pivot`);
        assert.ok(part.children.length > 0, `${id}: moving part contains geometry`);
      }
      assert.ok(model.leftArm.position.x < 0 && model.rightArm.position.x > 0, `${id}: two shoulders`);
      assert.notEqual(model.rest.head, model.head.rotation);
      assert.notEqual(model.rest.leftArm, model.leftArm.rotation);
      assert.notEqual(model.rest.rightArm, model.rightArm.rotation);
      assert.equal(model.eyes.length, 2);
      assert.notEqual(model.eyes[0], model.eyes[1]);
      for (const eye of model.eyes) assert.equal(eye.parent, model.head, `${id}: eyes follow the face`);
      model.eyes[0].scale.y = 0.07;
      assert.equal(model.eyes[1].scale.y, 1, `${id}: blinking one eye does not squash the other`);
      assert.equal(model.head.scale.y, 1, `${id}: blinking does not squash the face`);

      const unchangedRight = model.rightArm.matrixWorld.clone();
      const unchangedHead = model.head.matrixWorld.clone();
      const movingLeft = model.leftArm.matrixWorld.clone();
      model.leftArm.rotation.z -= 1.3;
      model.root.updateMatrixWorld(true);
      assert.ok(!movingLeft.equals(model.leftArm.matrixWorld), `${id}: arm pivots visibly`);
      assert.ok(unchangedRight.equals(model.rightArm.matrixWorld), `${id}: the opposite arm remains independent`);
      assert.ok(unchangedHead.equals(model.head.matrixWorld), `${id}: waving does not move the head`);

      let meshes = 0;
      model.root.traverse(node => {
        assert.ok(node.matrixWorld.elements.every(Number.isFinite), `${id}: finite world matrix`);
        if (!node.isMesh) return;
        meshes++;
        assert.ok(node.geometry.attributes.position.array.every(Number.isFinite), `${id}: finite vertices`);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          assert.equal(material.map, null, `${id}: geometry renders without network textures`);
        }
      });
      assert.ok(meshes >= 20, `${id}: complete face, body and limbs`);
    } finally {
      model.dispose();
    }
  }
});

function applyPose(model, action, time, base, accessories) {
  const pose = mascotPose(action, time);
  model.root.position.y = base.y + pose.y;
  model.root.rotation.set(0, pose.yaw, pose.roll);
  model.root.scale.set(base.scale.x * pose.scaleX, base.scale.y * pose.scaleY, base.scale.z);
  model.head.rotation.copy(model.rest.head);
  model.head.rotation.x += pose.headX;
  model.head.rotation.y += pose.headY;
  model.head.rotation.z += pose.headZ;
  model.leftArm.rotation.copy(model.rest.leftArm);
  model.leftArm.rotation.z += pose.leftZ;
  model.rightArm.rotation.copy(model.rest.rightArm);
  model.rightArm.rotation.z += pose.rightZ;
  model.eyes.forEach(eye => { eye.scale.y = pose.blink; });
  for (const { node, rotation } of accessories) {
    node.rotation.copy(rotation);
    node.rotation.z += Math.sin(time * 3.4) * 0.08 * (action === "celebrate" ? 1.8 : 1);
  }
  model.root.updateMatrixWorld(true);
}

test("the production camera contains every actual model vertex during greetings, idle activities and celebration peaks", () => {
  const camera = createMascotCamera();
  camera.updateMatrixWorld(true);
  const projection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  const matrix = new THREE.Matrix4();
  const vertex = new THREE.Vector3();
  const actions = ["celebrate", "greet", "wave", "stretch", "hop", "dance"];
  const times = [0, 0.5, 1, 1.5, 1.725, 2, 2.5, 3.2, 3.6];
  for (const id of IDS) {
    const model = createMascotModel(id);
    try {
      const base = { scale: model.root.scale.clone(), y: model.root.position.y };
      const meshes = [], accessories = [];
      model.root.traverse(node => {
        if (node.isMesh) meshes.push(node);
        if (/^(tail|left-ear|right-ear|left-wing|right-wing|antenna)$/.test(node.name)) {
          accessories.push({ node, rotation: node.rotation.clone() });
        }
      });
      for (const action of actions) for (const time of times) {
        applyPose(model, action, time, base, accessories);
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const mesh of meshes) {
          matrix.multiplyMatrices(projection, mesh.matrixWorld);
          const positions = mesh.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i).applyMatrix4(matrix);
            minX = Math.min(minX, vertex.x); maxX = Math.max(maxX, vertex.x);
            minY = Math.min(minY, vertex.y); maxY = Math.max(maxY, vertex.y);
          }
        }
        assert.ok(minX >= -1 && maxX <= 1 && minY >= -1 && maxY <= 1,
          `${id} ${action} at ${time}s clips: x=[${minX},${maxX}], y=[${minY},${maxY}]`);
      }
    } finally {
      model.dispose();
    }
  }
});

test("shared model geometry and materials are disposed exactly once even when cleanup is repeated", () => {
  for (const id of IDS) {
    const model = createMascotModel(id);
    const resources = new Set();
    let meshCount = 0;
    model.root.traverse(node => {
      if (!node.isMesh) return;
      meshCount++;
      resources.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) resources.add(material);
    });
    assert.ok(resources.size < meshCount * 2, `${id}: repeated parts reuse resources`);
    const disposed = new Map();
    for (const resource of resources) {
      disposed.set(resource, 0);
      resource.addEventListener("dispose", () => disposed.set(resource, disposed.get(resource) + 1));
    }
    model.dispose();
    model.dispose();
    for (const count of disposed.values()) assert.equal(count, 1, `${id}: dispose once per resource`);
    assert.equal(model.root.children.length, 0, `${id}: cleanup detaches all parts`);
  }
});
