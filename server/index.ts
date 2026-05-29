const PORT = config.port;

app.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level:     'info',
    event:     'server_start',
    port:      PORT,
    env:       process.env.NODE_ENV,
  }));
});

process.on('unhandledRejection', (reason) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level:     'error',
    event:     'unhandled_rejection',
    reason:    String(reason),
  }));
});
