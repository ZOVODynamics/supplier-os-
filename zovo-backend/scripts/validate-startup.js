const { startServer } = require('../server');

async function validateStartup() {
  let server;

  try {
    server = await startServer(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : null;

    if (!port) {
      throw new Error('Unable to determine backend validation port.');
    }

    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const payload = await response.json();

    if (!response.ok || payload.status !== 'ok' || payload.supabase !== 'connected') {
      throw new Error(payload.error || 'Backend health check failed.');
    }

    console.log('Backend startup validation succeeded.');
  } catch (error) {
    console.error(`Backend startup validation failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

validateStartup();
