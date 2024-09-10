import * as vray from 'vray';
import { systemTime } from "../../util/time";
import * as THREE from 'three';

export interface IVrayContext {
    renderer: vray.VRayRenderer
    lastPing: number;
    scene?: THREE.Scene;

}
const contexts: { [id: string]: IVrayContext } = {};

export function vrayClose(contextid: string) {
    const context = contexts[contextid];
    if (!context) return;
    delete contexts[contextid];
    context.renderer.close();
}

setInterval(() => {
    let ids = Object.keys(contexts);
    ids.forEach(id => {
        const context = contexts[id];
        if (context.lastPing && systemTime() - context.lastPing > 10 * 60 * 1000) {
            vrayClose(id);
        }
    });
}, 3000);


export default contexts;