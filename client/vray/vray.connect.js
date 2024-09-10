
let imageInterval, heartbeatInterval;
let id;

export class VrayService {

    constructor(service = "http://localhost:5560/render") {
        id = THREE.MathUtils.generateUUID();

        this.service = service;
        this.canvas = document.getElementById("vray-canvas")
        this.context = this.canvas.getContext("2d");

        const signals = editor.signals;
        const ms = 300

        signals.geometryChanged.add(_.debounce(this.update.bind(this, "geometryChanged"), ms));
        signals.objectAdded.add(_.debounce(this.update.bind(this, "objectAdded"), ms));
        signals.objectChanged.add(_.debounce(this.update.bind(this, "objectChanged"), ms));
        signals.objectRemoved.add(_.debounce(this.update.bind(this, "objectRemoved"), ms));
        signals.materialChanged.add(_.debounce(this.update.bind(this, "materialChanged"), ms));
        signals.cameraChanged.add(_.debounce(this.update.bind(this, "cameraChanged"), ms));
        signals.refreshSidebarObject3D.add((obj) => console.log("obj changed: ", obj.type));
    }

    async update(type, obj) {
        console.log(type, obj);
        const objJson = obj.toJSON();
        var body = { id, modified: { added: [], changed: [], removed: [] } };
        if (type.includes("Added")) body.modified.added.push(objJson);
        else if (type.includes("Changed")) body.modified.changed.push(objJson);
        else if (type.includes("Removed")) body.modified.removed.push(objJson);
        const rv = await $.post({ url: `${this.service}/modify`, data: body })
        console.log("update request - ", body);
    }

    async start() {
        const size = { width: this.canvas.width, height: this.canvas.height }
        $("#dialog").dialog({ minWidth: size.width, minHeight: size.height, width: size.width + 50, height: size.height + 70 });

        const content = { scene: editor.scene.toJSON(), camera: editor.camera.toJSON(), generator: "three" }
        const body = { content, id, size }
        const rv = await $.post({ url: `${this.service}/start`, data: body })
        console.log(rv);
        if (rv.errorCode != 0) alert(rv.msg);
        const self = this;

        imageInterval = setInterval(async () => {
            const resImg = await $.post({ url: `${self.service}/image`, data: { id } });
            if (!resImg.data.img || !resImg.data.img.data) {
                $("#dialog").dialog("close");
                return;
            }
            const context2d = self.context

            let canvasImgData = context2d.getImageData(0, 0, size.width, size.height);
            let imgData = canvasImgData.data;
            let renderData = resImg.data.img.data;
            renderData = pako.ungzip(renderData);
            let imgDataIndex = 0, renderDataIndex = 0;
            for (let i = 0; i < size.width; ++i)
                for (let j = 0; j < size.height; ++j) {
                    imgData[imgDataIndex++] = renderData[renderDataIndex++];
                    imgData[imgDataIndex++] = renderData[renderDataIndex++];
                    imgData[imgDataIndex++] = renderData[renderDataIndex++];
                    imgData[imgDataIndex++] = 255;
                }
            context2d.putImageData(canvasImgData, 0, 0)
        }, 1000)

        heartbeatInterval = setInterval(async () => await $.post({ url: `${self.service}/heartbeat`, data: { id } }), 1000 * 10)

    }
    async end() {
        const res = await $.post({ url: `${this.service}/end`, data: { id } })
        if (imageInterval) clearInterval(imageInterval), imageInterval = undefined;
        if (heartbeatInterval) clearInterval(heartbeatInterval), heartbeatInterval = undefined;
        $("#dialog").dialog("close");
    }
}

