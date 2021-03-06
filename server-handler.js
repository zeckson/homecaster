const fs = require(`fs`);
const path = require(`path`);
const https = require(`https`);

const sendFile = (res, fPath, type) => {
  const filePath = path.join(__dirname, fPath);
  const stat = fs.statSync(filePath);

  res.setHeader(`Content-Type`, type);
  res.setHeader(`Content-Length`, stat.size);
  res.writeHead(200);

  const readStream = fs.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(res);
};

module.exports = (req, res) => {
  const url = req.url || ``;
  console.log(`got request to: ${url}`);
  console.log(req.headers);

  res.statusCode = 200;
  res.setHeader(`Access-Control-Allow-Origin`, `*`);
  res.setHeader(`Access-Control-Allow-Methods`, `GET, HEAD, POST, OPTIONS`);
  res.setHeader(`Access-Control-Allow-Headers`, `Content-Type, Accept`);
  res.setHeader(`Access-Control-Max-Age`, `3600`);
  if (url.endsWith(`mp4`)) {
    sendFile(res, `video/test.mp4`, `video/mp4`);
  } else if (url.endsWith(`vtt`)) {
    sendFile(res, `video/video.vtt`, `text/vtt`);
  } else if (url.endsWith(`proxy`)) {
    https.get('https://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4', (remoteRes) => {
      console.log('statusCode:', remoteRes.statusCode);
      console.log('headers:', remoteRes.headers);

      res.setHeader(`Content-Length`, remoteRes.headers[`content-length`]);

      remoteRes.on(`error`, (e) => console.error(e));
      res.on(`error`, (e) => console.error(e));
      remoteRes.pipe(res)
    }).on('error', (e) => {
      console.error(e);
    });
  } else {
    res.setHeader(`Content-Type`, `text/plain`);
    res.end(`Hello World\n`);
  }
};
