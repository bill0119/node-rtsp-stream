const { RTSPClient, H264Transport } = require("yellowstone/dist");
const fs = require("fs");

// User-specified details here.
const url = "rtsp://10.16.5.144:554/live1s1.sdp";
const filename = "camera.264";
const username = "root";
const password = "1234567a";

// ffmpeg -f h264 -i camera.264 camera.mp4

// Step 1: Create an RTSPClient instance
const client = new RTSPClient(username, password);

// Step 2: Connect to a specified URL using the client instance.
//
// "keepAlive" option is set to true by default
// "connection" option is set to "udp" by default. 
client.connect(url, { connection: "tcp" })
  .then(details => {
    console.log("Connected. Video format is", details.codec);

    // Step 3: Open the output file
    if (details.isH264) {
      const file = fs.createWriteStream(filename);
      // Step 4: Create H264Transport passing in the client, file, and details
      const h264 = new H264Transport(client, file, details);
    }

    // Step 5: Start streaming!
    client.play();
  })
  .catch(e => console.log(e));

// The "data" event is fired for every RTP packet.
client.on("data", (channel, data, packet) => {
  console.log("RTP:", "ID=" + packet.id, "TS=" + packet.timestamp, "M=" + packet.marker);
});

// The "controlData" event is fired for ever RTCP packet.
client.on("controlData", (channel, rtcpPacket) => {
  console.log("RTCP:", "TS=" + rtcpPacket.timestamp, "PT=" + rtcpPacket.packetType);
});
