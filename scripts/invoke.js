// Runs the handler locally: npm run invoke
import { readFile } from 'node:fs/promises';
import { handler } from '../index.js';

const event = JSON.parse(await readFile(new URL('../events/test.json', import.meta.url), 'utf8'));
const context = { awsRequestId: 'local-test', getRemainingTimeInMillis: () => 900000 };

const result = await handler(event, context);
console.log('Result:', result);
