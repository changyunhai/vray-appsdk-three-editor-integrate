
import path from "path";
import fs from 'fs'
import * as ObjParser from '../server/services/vray/obj_parser.js'
import * as vray from 'vray';
import { addObj, makeTransform, setupScene } from "../server/services/vray/02-obj-import.js";
import { systemTime } from "../server/util/time.js";

console.log("-- begin -----")
let objParser = ObjParser.create(ObjParser.ConvexTriangulator);
var SCENE_PATH = path.join(process.env.VRAY_SDK!, 'scenes');

const renderer: vray.VRayRenderer = new vray.VRayRenderer();
const nodes: Array<vray.Node> = [];
renderer.keepInteractiveRunning = true;
renderer.size = { width: 200, height: 200 }
renderer.renderElements.add('z_depth');
renderer.renderElements.add('diffuse');
renderer.renderElements.add('color');

var meshFileName = path.join(SCENE_PATH, 'assets', 'teapot.obj');

console.log("-- begin load obj")
objParser.parseFile(meshFileName, function (obj: any) {
    console.log("-- end load obj")
    var brdf = renderer.classes.BRDFVRayMtl();
    brdf.diffuse = new vray.AColor(0.5, 1.0, 0.5, 1.0);
    brdf.reflect = new vray.AColor(0.8, 0.8, 0.8, 1.0);
    brdf.fresnel = true;
    var material: vray.MtlSingleBRDF = renderer.classes.MtlSingleBRDF();
    renderer.classes
    vray.Vector
    //vray.Proxy
    material.brdf = brdf;
    //material.c

    // add a true argument at the end to have the mesh smoothed
    const node: vray.Node = addObj(renderer, obj, material);
    node.setName("teaport root node")
    if (node) nodes.push(node);

    setupScene(renderer, ObjParser.getMaxExtent(obj.vertices));
    renderer.exportSync(systemTime() + "-" + "test.vrscene");


    const willRender: boolean = false;
    if (!willRender) {
        console.log("--- close ---")
        renderer.close();
    } else {
        renderer.startSync();
        renderer.waitForRenderEnd(300, function () {
            console.log("--- close ---");
            const vrayImg: vray.VRayImage = renderer.getImage()!;
            vrayImg.changeGamma(2.2);
            vrayImg.saveSync(systemTime() + "-full.png")

            const renderElements = renderer.renderElements.getAll();

            for (var i = 0; i < renderElements.length; ++i) {
                var renderElement: vray.RenderElement | null = renderElements[i];
                if (!renderElement) continue;
                var buf = renderElement.getData()
                var buf2 = new Float32Array(buf.buffer)
                const data = Array.from(buf2)
                console.log("Channel " + renderElement.name
                    + ", Format(" + renderElement.binaryFormat
                    + "), PixelFormat(" + renderElement.defaultPixelFormat + ")"
                    + ", data.length=" + data.length
                );
                fs.writeFileSync(systemTime() + "-" + renderElement.name + ".json", JSON.stringify(data))


                var reImage = renderElement.getImage();
                reImage.saveSync(systemTime() + "-" + renderElement.name + ".png");
                reImage.close();

            }
            renderer.close();
        });
    }
});