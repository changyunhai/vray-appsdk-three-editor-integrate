import * as express from "express";
import { makeJsonResponse } from "./common";
import { logger } from "../config";
import { IVrayModifyRequest, IVrayRequest, IVrayStartRequest, vrayModify, vrayImage, vrayStart, vrayHeartbeat, vrayEnd } from "../services/vray";

export const register = (app: express.Application) => {

    var router_vray = express.Router();
    app.use("/render", router_vray);

    router_vray.post("/start", async (req: any, res) => {
        let rv = undefined;
        const creq: IVrayStartRequest = req.body as IVrayStartRequest;
        try {
            rv = await vrayStart(creq);//{ id: 'test', size: { width: 400, height: 300 } });
        } catch (error: any) {
            logger.error(error);
            return makeJsonResponse(res, {}, 100, (error as Error).message);
            
        }
        return makeJsonResponse(res, rv);
    });
    router_vray.post("/modify", (req: any, res) => {
        let rv = undefined;
        const creq: IVrayModifyRequest = req.body as IVrayModifyRequest;
        try {
            rv = vrayModify(creq);//{ id: 'test', property: "name", value: parseFloat(req.body.value) });
        } catch (error: any) {
            logger.error(error);
            return makeJsonResponse(res, {}, 100, (error as Error).message);
            
        }
        return makeJsonResponse(res, rv);
    });
    router_vray.post("/image", (req: any, res) => {
        let rv = undefined;
        const creq: IVrayRequest = req.body as IVrayRequest;
        try {
            rv = vrayImage(creq);
        } catch (error: any) {
            logger.error(error);
            return makeJsonResponse(res, {}, 100, (error as Error).message);
        }
        return makeJsonResponse(res, rv);
    });
    router_vray.post("/heartbeat", (req: any, res) => {
        let rv = undefined;
        const creq: IVrayRequest = req.body as IVrayRequest;
        try {
            rv = vrayHeartbeat(creq);
        } catch (error: any) {
            logger.error(error);
            return makeJsonResponse(res, {}, 100, (error as Error).message);
        }
        return makeJsonResponse(res, rv);
    });
    router_vray.post("/end", (req: any, res) => {
        let rv = undefined;
        const creq: IVrayRequest = req.body as IVrayRequest;
        try {
            rv = vrayEnd(creq);
        } catch (error: any) {
            logger.error(error);
            return makeJsonResponse(res, {}, 100, (error as Error).message);
        }
        return makeJsonResponse(res, rv);
    });
}