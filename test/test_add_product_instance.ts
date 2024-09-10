import * as vray from 'vray';
import fs from 'fs';

// ----------renderer init------
const renderer: vray.VRayRenderer = new vray.VRayRenderer();
renderer.keepInteractiveRunning = true;
renderer.size = { width: 300, height: 300 }
renderer.loadSync("d:/vrscene/env.vrscene");// load template

const dummyDiffuse: vray.BRDFDiffuse = renderer.classes.BRDFDiffuse()
dummyDiffuse.color = new vray.Color(1, 1, 1)
const dummyMaterial: vray.MtlSingleBRDF = renderer.classes.MtlSingleBRDF("________dummy_white_diffuse_material______");
dummyMaterial.brdf = dummyDiffuse as vray.Plugin;

const identifiedTransform: vray.Transform = new vray.Transform(new vray.Matrix(1.0), new vray.Vector(0, 0, 0));
const zeroTransform: vray.Transform = new vray.Transform();
// --------init end------


function loadProduct(productId: string, productVrsceneFileContent: string): vray.Instancer2 {
    const nodeNames: string[] = [];
    const instancedType: string[] = ["Node", "LightRectangle"];
    renderer.appendAsTextFilteredSync(productVrsceneFileContent, (type: string, name: string) => {
        const newName = `__$${productId}@${type}$__${name}`
        if (instancedType.includes(type)) nodeNames.push(newName);
        return newName;
    });
    const nodes: Array<vray.Node> = [];
    nodeNames.forEach((name: string, idx: number) => {
        const node: vray.Node = renderer.plugins[name] as vray.Node;
        node.visible = false;
        nodes.push(node);
    })
    const instancer: vray.Instancer2 = buildInstancer(nodes.map(node => ({ node, transform: identifiedTransform })));
    return instancer;
}

function makeInstanceNode(instancer: vray.Instancer2, transform: vray.Transform): vray.Node {
    const nodeInst: vray.Node = renderer.classes.Node();
    nodeInst.geometry = instancer as vray.Plugin;
    nodeInst.transform = transform;
    nodeInst.material = dummyMaterial as vray.Plugin
    return nodeInst;
}

function makeTransform(scale: number, location: number[]): vray.Transform {
    return new vray.Transform(new vray.Matrix(scale), new vray.Vector(location[0], location[1], location[2]))
}

function buildInstancer(combined: Array<{ node: vray.Node, transform: vray.Transform }>): vray.Instancer2 {
    const instancer: vray.Instancer2 = renderer.classes.Instancer2();
    const instances: Object[] = [0];
    for (var i = 0; i < combined.length; ++i) {
        instances.push([i, combined[i].transform, zeroTransform, combined[i].node])
    }
    instancer.instances = instances;
    instancer.use_time_instancing = 0;
    return instancer;
}

//-------------------------------
// load begin: 
//
const cube: vray.Instancer2 = loadProduct("cube", fs.readFileSync("d:/vrscene/instance.vrscene", 'utf8'));
var node: vray.Node;

const display2x2x2: boolean = true;// test
if (display2x2x2) {
    node = makeInstanceNode(cube, identifiedTransform);
    node.visible = false;
    const cube2 = buildInstancer([
        { node, transform: makeTransform(0.5, [0, 0, 0]) },
        { node, transform: makeTransform(0.5, [1, 0, 0]) }
    ]);
    node = makeInstanceNode(cube2, identifiedTransform);
    node.visible = false;
    const cube2x2 = buildInstancer([
        { node, transform: makeTransform(0.5, [0, 0, 0]) },
        { node, transform: makeTransform(0.5, [0, 1, 0]) }
    ]);
    node = makeInstanceNode(cube2x2, identifiedTransform);
    node.visible = false;
    const cube2x2x2 = buildInstancer([
        { node, transform: makeTransform(0.5, [0, 0, 0]) },
        { node, transform: makeTransform(0.5, [0, 0, 1]) }
    ]) as vray.Plugin;
    node = makeInstanceNode(cube2x2x2, identifiedTransform);
} else {
    node = makeInstanceNode(cube, makeTransform(0.5, [1, 0, 0]))
    node = makeInstanceNode(cube, makeTransform(0.5, [1, 1, 0]))
    node = makeInstanceNode(cube, makeTransform(0.5, [0, 0, 1]))
}


renderer.exportSync("d:/vrscene/merged.vrscene")

renderer.startSync();
renderer.waitForRenderEnd(8000, (err: boolean) => {
    renderer.close();
})