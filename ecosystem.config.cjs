/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "qknou-fe",
      cwd: __dirname,
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        API_PROXY_TARGET: "https://api.qknou.kr",
      },
    },
  ],
};
