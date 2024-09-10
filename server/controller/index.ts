import * as express from "express";
import {register as commonRegister }from './common';
import {register as vrayRegister }from './vray';

export const register = (app: express.Application) => {
    commonRegister(app);
    vrayRegister(app)
}

