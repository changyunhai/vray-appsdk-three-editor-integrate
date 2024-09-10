import * as vray from 'vray';
import * as THREE from 'three'

export interface ITranslator {
    (threeObject: THREE.Object3D, renderer: vray.VRayRenderer, threeScene:THREE.Scene): vray.Plugin[]
}

export class CTranslatorBase {
    protected renderer: vray.VRayRenderer;

    constructor(renderer: vray.VRayRenderer) {
        this.renderer = renderer
    }
    create(threeObject: THREE.Object3D, threeScene:THREE.Scene): vray.Plugin[] { return [] };
    update(threeObject: THREE.Object3D, threeScene:THREE.Scene): void { };
    remove(threeObject: THREE.Object3D, threeScene:THREE.Scene): void {

    }
}
