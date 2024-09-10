
import * as vray from 'vray';
import * as THREE from 'three';
import { CTranslatorBase, ITranslator } from './base';
import { Object3D } from 'three';
import { translators } from '.';

export class CTranslatorScene extends CTranslatorBase {
    override create(threeObject: THREE.Object3D, threeScene:THREE.Scene): vray.Plugin[] {
        return buildScene(threeObject, this.renderer,threeScene)
    }
    override update(threeObject: THREE.Object3D, threeScene:THREE.Scene): void {
        //throw new Error('Method not implemented.');
    }

}
const buildScene: ITranslator = (scene: THREE.Scene, renderer: vray.VRayRenderer, threeScene:THREE.Scene) => {
    const nodes: vray.Plugin[] = []
    scene.traverse((obj: Object3D) => {
        if (obj == scene) return;
        if (translators[obj.type]) {
            const n = new (translators[obj.type])(renderer);
            n.create(obj,threeScene)
        }
    });
    return nodes;
}