import * as express from "express";


const startTime: string = new Date().toLocaleString();

export const makeJsonResponse = (res: any, jsonData?: any, errorCode: number = 0, msg: string = "success") => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Content-Type", "application/json;charset=utf-8");
    if (jsonData) res.json({ errorCode, msg, data: jsonData });
    return res;
}

export const register = (app: express.Application) => {
    
    // home page
    app.get("/", (req: any, res) => {
        res.render("pages/index", { startTime });
    });

    app.get("/about", (req: any, res) => {
        res.render("pages/about");
    });

    app.get("/exit", (req: any, res) => {
        const msg = "_________exit______________"
        res.send(msg)
        app.removeAllListeners();
        console.log(msg);
        process.exit();
    });
    
}