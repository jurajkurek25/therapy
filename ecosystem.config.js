module.exports = {
  apps: [{
    name: 'teraplan',
    script: '/home/teraplan/htdocs/teraplan.eu/start.sh',
    interpreter: 'bash',
    cwd: '/home/teraplan/htdocs/teraplan.eu',
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '512M',
    restart_delay: 3000,
    max_restarts: 10,
  }]
};
