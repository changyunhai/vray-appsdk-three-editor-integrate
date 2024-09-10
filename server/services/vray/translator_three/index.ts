
import * as vray from 'vray';
import * as THREE from 'three'
import { CTranslatorPerspectiveCamera } from './camera';
import { CTranslatorScene } from './container';
import { CTranslatorMesh } from './geometry';
import { CTranslatorBase } from './base';


export const DEFAULT_DIFFUSE_MATERIAL: string = "________dummy_white_diffuse_material______"

export function initVrayRenderer(size: { width: number, height: number } = { width: 400, height: 300 }): vray.VRayRenderer {

    const renderer: vray.VRayRenderer = new vray.VRayRenderer();
    renderer.keepInteractiveRunning = true;
    renderer.size = size;
    renderer.autoCommit = false;
    //renderer.loadSync("d:/vrscene/env_xyz.vrscene");// load template

    let dome = renderer.classes.LightDome();
    dome.transform = new vray.Transform(new vray.Matrix(1.0), new vray.Vector(0, 0, 0));
    dome.intensity = 0.25;

    const dummyDiffuse: vray.BRDFDiffuse = renderer.classes.BRDFDiffuse()
    dummyDiffuse.color = new vray.Color(1, 1, 1)
    const dummyMaterial: vray.MtlSingleBRDF = renderer.classes.MtlSingleBRDF(DEFAULT_DIFFUSE_MATERIAL);
    dummyMaterial.brdf = dummyDiffuse as vray.Plugin;

    return renderer;
}
export function makeVrayTransform(matrixWorld: THREE.Matrix4): vray.Transform {
    const te: number[] = matrixWorld.elements;
    return new vray.Transform(te[0], te[1], te[2], te[4], te[5], te[6], te[8], te[9], te[10], te[12], te[13], te[14])
}

//--------------- translators ----------------

export const translators: { [threeTypeName: string]: typeof CTranslatorBase } = {
    "Mesh": CTranslatorMesh,
    "PerspectiveCamera": CTranslatorPerspectiveCamera,
    "Scene": CTranslatorScene

};