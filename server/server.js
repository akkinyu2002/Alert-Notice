require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\nAlert System API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`\nTest credentials:`);
  console.log(`  Admin: admin@alert.np / admin123`);
  console.log(`  Hospital: bir@hospital.np / admin123`);
  console.log(`  User: ram@gmail.com / user123\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Stop the existing process or set a different PORT in server/.env.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});
