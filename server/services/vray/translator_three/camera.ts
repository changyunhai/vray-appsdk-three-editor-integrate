

import * as vray from 'vray';
import * as THREE from 'three';
import { makeVrayTransform } from '.';
import { CTranslatorBase, ITranslator } from './base';

export class CTranslatorCamera extends CTranslatorBase {

}

export class CTranslatorPerspectiveCamera extends CTranslatorCamera {
    override create(threeObject: THREE.Object3D, threeScene: THREE.Scene): vray.Plugin[] {
        return buildPerspectiveCamera(threeObject, this.renderer, threeScene)
    }
    override update(threeObject: THREE.Object3D, threeScene: THREE.Scene): void {
        buildPerspectiveCamera(threeObject, this.renderer, threeScene)
    }

}

const buildPerspectiveCamera: ITranslator = (threeCamera: THREE.PerspectiveCamera, renderer: vray.VRayRenderer, threeScene: THREE.Scene) => {
    var renderView: vray.RenderView = renderer.classes.RenderView.getInstanceOrCreate();
    const te: number[] = threeCamera.matrix.elements;
    renderView.transform = makeVrayTransform(threeCamera.matrix);
    return [renderView as vray.Plugin];
}

