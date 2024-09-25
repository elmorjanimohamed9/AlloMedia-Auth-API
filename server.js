const app = require('./src/app');
const http = require('http');

const port = process.env.PORT || 5000;

app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});