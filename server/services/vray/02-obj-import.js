// For more info on plugins, parameters and how to use them refer to the
// V-Ray AppSDK documentation.

var path = require('path');

var vray = require(path.join(process.env.VRAY_SDK, 'node', 'vray'));

/**
 * Creates a transform with the specified rotation and scale.
 */
function makeTransform(rotX = 0, rotY = 0, rotZ = 0, scale = 1, offset = vray.Vector(), yUp=false) {
  var mS = vray.Matrix(scale);
  var mX = vray.Matrix.makeRotationMatrixX(rotX);
  var mY = vray.Matrix.makeRotationMatrixY(rotY);
  var mZ = vray.Matrix.makeRotationMatrixZ(rotZ);
  var transform = vray.Transform(mS.mul(mZ.mul(mY.mul(mX))), offset);
  if(yUp) transform.rotX
  return transform;
}

/**
 * Sets up a scene with camera and light.
 *
 * @param renderer - Renderer of the scene.
 */
function setupScene(renderer, objDiameter) {
  var renderView = renderer.classes.RenderView();

  camPos = vray.Vector(0, -2 * objDiameter, 0.2 * objDiameter);
  camTransform = makeTransform(Math.PI / 2, 0, 0, 1, camPos);
  renderView.transform = camTransform;

  dome = renderer.classes.LightDome();
  dome.transform = makeTransform();
  dome.intensity = 0.25;

  // place a light over and slightly behind the camera
  rect = renderer.classes.LightRectangle();
  adjust = makeTransform(-Math.PI / 9, 0, Math.PI / 3, 1, camPos.mul(0.1));
  rect.transform = vray.Transform(adjust.matrix.mul(camTransform.matrix), adjust.matrix.mulVector(camPos));
  rect.u_size = 0.5 * objDiameter;
  rect.v_size = 0.35 * objDiameter;
  rect.intensity = 10;
}


/**
 * Adds a geometric object to the scene.
 *
 * @param renderer - The V-Ray renderer.
 * @param obj - Geometric data container.
 * @param material - Material to apply to the object.
 * @param smooth - Whether to apply smoothing to the mesh.
 */
function addObj(renderer, obj, material, smooth = false) {
  if (obj.vertices.length === 0 || obj.faces.length === 0) {
    return;
  }

  var mesh = renderer.classes.GeomStaticMesh();
  mesh.vertices = obj.vertices;
  mesh.faces = obj.faces;

  if (obj.vertexNormals.length > 0 && obj.faceNormals.length > 0) {
    mesh.normals = obj.vertexNormals;
    mesh.faceNormals = obj.faceNormals;
  }

  if (obj.textureVertices.length > 0 && obj.faceTextures.length > 0) {
    var channel = vray.List();
    channel.push(1);
    channel.push(obj.textureVertices);
    channel.push(obj.faceTextures);
    mesh.map_channels = channel;
  }

  if (smooth) {
    // this will dynamically generate a higher quality mesh
    var smoothed = renderer.classes.GeomStaticSmoothedMesh();
    smoothed.mesh = mesh;
    mesh = smoothed;
  }

  node = renderer.classes.Node();
  node.geometry = mesh;
  node.material = material;
  // adjust Y-up object to Z-up scene
  node.transform = makeTransform(Math.PI / 2, 0, 0);
  return node;
}


exports.makeTransform = makeTransform
exports.setupScene = setupScene
exports.addObj = addObj

