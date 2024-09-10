import * as vray from 'vray';

const renderer: vray.VRayRenderer = new vray.VRayRenderer();
renderer.keepInteractiveRunning = true;
renderer.size = { width: 300, height: 300 }

renderer.loadSync("d:/vrscene/merged.vrscene");// load template

renderer.startSync();
renderer.waitForRenderEnd(5000, (err: boolean) => {
    renderer.close();
})