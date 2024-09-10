
import * as ObjParser from './obj_parser.js';
import * as vray from 'vray';
import { addObj, setupScene } from "./02-obj-import.js";
import path from "path";
import * as THREE from 'three';
import { PerspectiveCamera, Scene, Object3D } from 'three';
import { translators } from './translator_three';


export async function buildTeapotScene(renderer: vray.VRayRenderer) {
    const nodes: Array<vray.Node> = [];
    let objParser = ObjParser.create(ObjParser.ConvexTriangulator);
    var meshFileName = path.join(process.env.VRAY_SDK, 'scenes', 'assets', 'teapot.obj');
    const obj: any = await objParser.parseFile(meshFileName)
    if (obj) {
        var brdf = renderer.classes.BRDFVRayMtl();
        brdf.diffuse = new vray.AColor(0.5, 1.0, 0.5, 1.0);
        brdf.reflect = new vray.AColor(0.8, 0.8, 0.8, 1.0);
        brdf.fresnel = true;
        var material = renderer.classes.MtlSingleBRDF();
        material.brdf = brdf;

        // add a true argument at the end to have the mesh smoothed
        const node = addObj(renderer, obj, material);
        if (node) nodes.push(node);

        setupScene(renderer, ObjParser.getMaxExtent(obj.vertices));
    };
    return nodes;
}

export interface IThreeScene {
    scene: any,
    camera: any
}
export interface IThreeSceneRefresh {
    added?: any[];
    changed?: any[];
    removed?: any[];
}
export async function buildFromThreeScene(renderer: vray.VRayRenderer, threeSceneJson: IThreeScene): Promise<Scene> {
    console.log(__dirname)
    //const envText = (await axios.get("/env.vrscene")).data
    //renderer.loadSync(path.join(__dirname, "env.vrscene"));

    const loader = new THREE.ObjectLoader()
    const threeScene: Scene = loader.parse(threeSceneJson.scene) as Scene;
    const threeCamera: PerspectiveCamera = loader.parse(threeSceneJson.camera) as PerspectiveCamera;

    [threeScene, threeCamera].forEach((obj: THREE.Object3D) => {
        if (translators[obj.type]) {
            const n = new translators[obj.type](renderer);
            n.create(obj, threeScene);
        }
    })

    const nodes: Array<vray.Node> = [];
    renderer.exportSync("d:/vrscene/from_three_scene.vrscene")

    return threeScene;
}

export function threeSceneChange(renderer: vray.VRayRenderer, refreshed: IThreeSceneRefresh, scene?: THREE.Scene) {
    const loader = new THREE.ObjectLoader();

    refreshed.added?.forEach(add => {
        const obj = loader.parse(add) as Object3D;
        if (translators[obj.type]) {
            const n = new translators[obj.type](renderer);
            n.create(obj, scene);
        }
    })
    refreshed.changed?.forEach(change => {
        const obj = loader.parse(change) as Object3D;
        if (translators[obj.type]) {
            const n = new translators[obj.type](renderer);
            n.update(obj, scene);
        }
    })
    refreshed.removed?.forEach(r => {
        const obj = loader.parse(r) as Object3D;
        if (translators[obj.type]) {
            const n = new translators[obj.type](renderer);
            n.remove(obj, scene);
        }
    })
}