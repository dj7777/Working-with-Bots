server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));