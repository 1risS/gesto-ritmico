import osc from "osc";
import express from "express";
import WebSocket from "ws";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = app.listen(8000);

let udpReady = false;

app.use("/", express.static(__dirname));

var wss = new WebSocket.Server({ server });

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 8090,
  metadata: true,
});

// Listen for Web Socket connections
console.log("HTTP and WebSocket server is listening on port 8000");
wss.on("connection", function (socket) {
  var socketPort = new osc.WebSocketPort({
    socket: socket,
    metadata: true,
  });

  udpPort.open();

  // When the port is read, send an OSC message to
  udpPort.on("ready", function () {
    console.log("UDP Port is ready and listening for OSC messages");
    udpReady = true;
  });

  socketPort.on("message", function (oscMsg) {
    console.log("An OSC Message was received:", oscMsg);
    
    if (!udpReady) return;
    // Forward message to UDP port
    udpPort.send(oscMsg, "192.168.88.231", 8081);
  });
});
