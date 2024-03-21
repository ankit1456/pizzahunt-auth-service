import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const publicKey = fs.readFileSync('./certs/public.pem');

rsaPemToJwk(publicKey, { use: 'sig' }, 'public');
