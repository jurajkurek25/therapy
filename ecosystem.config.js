module.exports = {
  apps: [{
    name: 'teraplan',
    script: 'npm',
    args: 'start',
    cwd: '/home/user/therapy',
    env: {
      NODE_ENV: 'production',
      PORT: 3210,
      HOSTNAME: '127.0.0.1',
    },
    max_memory_restart: '512M',
    restart_delay: 3000,
    max_restarts: 10,
  }]
};
