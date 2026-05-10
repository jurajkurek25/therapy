module.exports = {
  apps: [{
    name: 'teraplan',
    script: 'node_modules/.bin/next',
    args: 'start -p 3210 -H 127.0.0.1',
    cwd: '/home/teraplan/htdocs/teraplan.eu',
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '512M',
    restart_delay: 3000,
    max_restarts: 10,
  }]
};
