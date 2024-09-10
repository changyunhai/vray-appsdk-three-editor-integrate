
import * as vray from 'vray';
import { makeTransform } from "./02-obj-import.js";
import { logger } from "../../config";
import contexts, { IVrayContext, vrayClose } from './context';
import { systemTime } from "../../util/time";
import zlib from 'zlib';
import { buildFromThreeScene, buildTeapotScene, IThreeScene, threeSceneChange } from "./scene";
import { initVrayRenderer } from './translator_three';

export interface IVrayRequest {
    id: string;
}
export interface IVrayStartRequest extends IVrayRequest {
    content?: any;
    size: { width: number, height: number }
}
export interface IVrayModifyRequest extends IVrayRequest {
    modified?: any;
}

//----------------------

export interface IVrayResponse {
    errorCode: number;
    msg: string;
}
export interface IVrayImageResponse extends IVrayResponse {
    img?: { width: number, height: number, data: Array<number> };
}

//-------------------------

export async function vrayStart(start: IVrayStartRequest): Promise<IVrayResponse> {
    if (contexts[start.id]) {
        const msg = `vrayStart: already has this context: ${start.id}`
        logger.error(msg);
        return { msg, errorCode: 10 };
    }
    const renderer: vray.VRayRenderer = initVrayRenderer(start.size);
    const context:IVrayContext = contexts[start.id] = { renderer, lastPing: systemTime() }

    if (!start.content) {// test scene
        await buildTeapotScene(renderer);
    } else if (start.content.generator == 'three') {
        context.scene = await buildFromThreeScene(renderer, start.content as IThreeScene)
    }

    logger.log(`renderer start: ${start.id}`)
    renderer.startSync();
    renderer.waitForRenderEnd(function () {
        logger.log(`renderer close:  ${start.id}`)
        vrayClose(start.id);
    });


    return { msg: "OK", errorCode: 0 }
}

export function vrayModify(req: IVrayModifyRequest): IVrayResponse {
    if (!contexts[req.id]) {
        const msg = `vray modify: the context: ${req.id} has not started!`
        logger.error(msg);
        return { msg, errorCode: 10 };
    }
    const context = contexts[req.id];
    context.lastPing = systemTime();
    if (req.modified) threeSceneChange(context.renderer, req.modified,context.scene)
    context.renderer.commit()
    return { msg: "OK", errorCode: 0 }
}
export function vrayImage(req: IVrayRequest): IVrayImageResponse {
    const contextid = req.id;
    if (!contexts[contextid]) {
        const msg = `vray image : the context: ${contextid} has not started!`
        logger.error(msg);
        return { msg, errorCode: 10, img: undefined };
    }
    const renderer: vray.VRayRenderer = contexts[contextid].renderer;
    const vrayImg: vray.VRayImage = renderer.getImage();
    vrayImg.changeGamma(2.2);
    let data_u32Array_buf = zlib.gzipSync(vrayImg.toBitmapData().buffer);
    vrayImg.close();

    return {
        msg: "OK", errorCode: 0,
        img: { width: vrayImg.width, height: vrayImg.height, data: Array.from(data_u32Array_buf) }
    }
}
export function vrayHeartbeat(req: IVrayRequest): IVrayResponse {
    const contextid = req.id;
    if (!contexts[contextid]) {
        const msg = `vray heart : the context: ${contextid} has not started!`
        logger.error(msg);
        return { msg, errorCode: 10, };
    }
    contexts[contextid].lastPing = systemTime()
    return { msg: "OK", errorCode: 0 }
}
export function vrayEnd(req: IVrayRequest): IVrayResponse {
    const contextid = req.id;
    if (!contexts[contextid]) {
        const msg = `vray end : the context: ${contextid} has not started!`
        logger.error(msg);
        return { msg, errorCode: 10, };
    }
    vrayClose(contextid);
    return { msg: "OK", errorCode: 0 }
}