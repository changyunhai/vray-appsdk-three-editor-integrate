
import express from "express";
import path from "path";
import { config } from './config';
import { register } from "./controller";
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';


/**
 * Usage:
 *  npx ts-node src/index.ts  80
 * will use 80 port. if not specified port parameter:
 *  npx ts-node src/index.ts  
 * will use port in config file.
 */
function main() {
    let port = config.SERVER_PORT;
    if (process.argv.length > 2) port = parseInt(process.argv[2]);

    const app = express();

    app.all('*', function (req, res, next) {
        if (req.headers.origin) {

        } res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1');
        next();
    });

    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ limit: '100mb' }))
    //app.use(express.json());

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "asset"));
    app.use("/editor", express.static(path.join(__dirname, "..", "client")));

    // Configure routes
    register(app);
    console.log("register OK")

    const swaggerOptions = {
        definition: {
            openapi: '3.0.1',
            info: {
                title: 'vray appsdk tool API',
                description: 'vray appsdk',
                version: '1.0.0'
            },
            servers: [
                { url: `http://localhost:${port}` },
            ]
        },
        apis: ['./**/*.yaml', './**/*.ts']
    }

    const swaggerSpec = swaggerJsDoc(swaggerOptions)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    app.use('/swagger.json', (req, res) => res.json(swaggerSpec))

    // start the express server
    app.listen(port, () => {
        // tslint:disable-next-line:no-console
        console.log(`server started at port: ${port}\n`);
    });
}

main();
