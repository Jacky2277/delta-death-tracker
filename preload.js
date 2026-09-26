const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("deltaApp", {
  version: "0.1.0",
  author: "Jacky2277"
});
