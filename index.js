const express = require('express');
const crypto = require('crypto');
const childProcess = require('child_process');

const { secret } = require('./secrets.json');

const app = express();
app.use(express.json());

function verifySignature(req) {
  const headerSig = req.get('X-Hub-Signature-256');
  const headerSigBuf = Buffer.from(headerSig, 'utf8');
  const bodyStr = JSON.stringify(req.body);
  const bodySig = 'sha256=' + crypto.createHmac('sha256', secret)
                                                   .update(bodyStr)
                                                   .digest('hex');
  const bodySigBuf = Buffer.from(bodySig, 'utf8');
  return crypto.timingSafeEqual(headerSigBuf, bodySigBuf);
}

app.post('/ears', async (req, res) => {
    req.setEncoding('utf8');
    // Intentionally lie when there is a bad signature
    if (!verifySignature(req)) {
      res.status(200);
      res.send('Success');
    } else {
      // Check other stuff here
      // Check it is the master branch that has been updated
      childProcess.exec('/home/band-aid/deploy.sh');
      res.status(200);
      res.send('Success');
    }
});

const server = app.listen(3000);
