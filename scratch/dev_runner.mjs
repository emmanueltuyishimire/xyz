import { dev } from 'astro';

try {
  console.log('Starting Astro dev server...');
  const server = await dev({
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 4321
    }
  });
  console.log('Astro dev server started successfully at:', server.address);
} catch (err) {
  console.error('Error starting Astro dev server:', err);
}
