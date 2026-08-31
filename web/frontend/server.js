import { createRequestHandler } from '@react-router/express';
import express from 'express';

const app = express();

app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }));
app.use(express.static('build/client', { maxAge: '1h' }));

const requestHandler = createRequestHandler({
    build: () => import('./build/server/index.js'),
});
app.all('/', requestHandler);
app.all('/*splat', requestHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
