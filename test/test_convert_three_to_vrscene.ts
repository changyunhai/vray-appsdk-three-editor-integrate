import * as vray from 'vray';
import * as threeSceneJson from './three_scene.json'
import * as threeCameraJson from './three_camera.json'

import * as THREE from 'three'
import axios from 'axios';
import {
    Vector3Like, Box3Helper, BoxGeometry, BoxHelper, Group, LineBasicMaterial, BufferGeometry,
    Float32BufferAttribute, GridHelper, LineSegments, Mesh, MeshBasicMaterial, SphereGeometry,
    Vector3, Object3D, PerspectiveCamera, Scene, WebGLRenderer, Raycaster, Vector2,
    Intersection,
    Color
} from 'three';
import { makeTransform } from '../server/services/vray/02-obj-import.js';

const renderer: vray.VRayRenderer = new vray.VRayRenderer();
renderer.keepInteractiveRunning = true;
renderer.size = { width: 300, height: 300 }
renderer.loadSync("d:/vrscene/env_xyz.vrscene");// load template


const dummyDiffuse: vray.BRDFDiffuse = renderer.classes.BRDFDiffuse()
dummyDiffuse.color = new vray.Color(1, 1, 1)
const dummyMaterial: vray.MtlSingleBRDF = renderer.classes.MtlSingleBRDF("________dummy_white_diffuse_material______");
dummyMaterial.brdf = dummyDiffuse as vray.Plugin;

const identifiedTransform: vray.Transform = new vray.Transform(new vray.Matrix(1.0), new vray.Vector(0, 0, 0));
const zeroTransform: vray.Transform = new vray.Transform();

const angleToRadius = (angle: number) => { return angle / 180 * Math.PI }
const makeVrayTransform = (matrixWorld: THREE.Matrix4) => {
    const te: number[] = matrixWorld.elements;
    return new vray.Transform(te[0], te[1], te[2], te[4], te[5], te[6], te[8], te[9], te[10], te[12], te[13], te[14])
}

const loader = new THREE.ObjectLoader()
const threeScene: Scene = loader.parse(threeSceneJson) as Scene;
const threeCamera: PerspectiveCamera = loader.parse(threeCameraJson) as PerspectiveCamera;

const tmpPos: Vector3 = new Vector3(), tmpQuat: THREE.Quaternion = new THREE.Quaternion(), tmpScale: Vector3 = new Vector3();
const te: number[] = threeCamera.matrix.elements;

var renderView: vray.RenderView = renderer.classes.RenderView.getInstanceOrCreate();
renderView.transform = makeVrayTransform(threeCamera.matrix);

threeScene.traverse((obj: Object3D) => {
    if (obj.type != "Mesh") return;
    const mesh3: Mesh = obj as Mesh;
    console.log("mesh:", `${mesh3.uuid}@mesh`)
    var meshv: vray.GeomStaticMesh = renderer.classes.GeomStaticMesh();
    meshv.setName(`${mesh3.uuid.replace(/-/g, "_")}@mesh`)

    let buf3 = mesh3.geometry.getAttribute("position")
    let vecsv: any[] = [];

    for (var i = 0; i < buf3.count; ++i)vecsv.push(new vray.Vector(buf3.getX(i), buf3.getY(i), buf3.getZ(i)))
    meshv.vertices = new vray.VectorList(vecsv);

    buf3 = mesh3.geometry.getAttribute("normal"), vecsv = [];
    for (var i = 0; i < buf3.count; ++i)vecsv.push(new vray.Vector(buf3.getX(i), buf3.getY(i), buf3.getZ(i)))
    meshv.normals = new vray.VectorList(vecsv);

    const index = mesh3.geometry.getIndex()
    if (index) {
        meshv.faces = new vray.IntList(index.array);
    }

    // nodes: // `${mesh3.uuid}@mesh@node`
    const node = renderer.classes.Node();
    node.setName(`${mesh3.uuid.replace(/-/g, "_")}@mesh@node`)
    node.geometry = meshv as vray.Plugin;
    node.material = dummyMaterial as vray.Plugin;
    // adjust Y-up object to Z-up scene
    mesh3.getWorldPosition(tmpPos);
    mesh3.updateWorldMatrix(true, false);
    const transform: vray.Transform = makeTransform(0, 0, 0, 1, new vray.Vector(tmpPos.x, tmpPos.y, tmpPos.z));
    node.transform = makeVrayTransform(mesh3.matrixWorld);//transform
})

renderer.exportSync("d:/vrscene/from_three_scene.vrscene");

renderer.startSync();
renderer.waitForRenderEnd(5000, (err: boolean) => {
    renderer.close();
})
