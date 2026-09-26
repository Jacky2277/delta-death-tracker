const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("deltaApp", {
  version: "0.2.0",
  author: "Jacky2277"
});
