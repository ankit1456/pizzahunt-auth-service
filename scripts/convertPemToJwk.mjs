import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const publicKey = fs.readFileSync('./certs/public.pem');

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
rsaPemToJwk(publicKey, { use: 'sig' }, 'public');
