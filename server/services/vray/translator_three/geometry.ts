
import * as vray from 'vray';
import * as THREE from 'three';
import { DEFAULT_DIFFUSE_MATERIAL, makeVrayTransform } from '.';
import { CTranslatorBase, ITranslator } from './base';

export class CTranslatorMesh extends CTranslatorBase {
    override create(threeObject: THREE.Object3D, threeScene: THREE.Scene): vray.Plugin[] {
        return buildMesh(threeObject, this.renderer, threeScene)
    }
    override update(threeObject: THREE.Object3D, threeScene: THREE.Scene): void {
        let objInScene: THREE.Object3D | undefined = undefined;
        threeScene.traverse(c => {
            if (c.uuid == threeObject.uuid) objInScene = c;
        })
        if (objInScene) objInScene.copy(threeObject)
        buildMesh(objInScene!, this.renderer, threeScene)
    }

}

const buildMesh: ITranslator = (mesh3: THREE.Mesh, renderer: vray.VRayRenderer, threeScene: THREE.Scene) => {
    const meshName = `_${mesh3.uuid.replace(/-/g, "_")}@mesh`
    console.log("mesh:", meshName)
    var meshv: vray.GeomStaticMesh = renderer.plugins[meshName] || renderer.classes.GeomStaticMesh(meshName);

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
    const nodeName = `_${mesh3.uuid.replace(/-/g, "_")}`
    const node = renderer.plugins[nodeName] || renderer.classes.Node(nodeName);
    node.geometry = meshv as vray.Plugin;
    node.material = renderer.plugins[DEFAULT_DIFFUSE_MATERIAL];
    mesh3.updateWorldMatrix(true, false);
    node.transform = makeVrayTransform(mesh3.matrixWorld);//transform
    return [];
}
