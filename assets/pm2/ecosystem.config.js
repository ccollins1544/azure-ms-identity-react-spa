module.exports = {
  apps: [
    // pm2 startOrRestart ecosystem.config.js --only azure_spa_main --env production
    {
      name: 'azure_spa_main', // azure-ms-identity-react-spa_<branch-name> 
      cwd: "/home/ubuntu/azure_spa_main/current",
      script: 'npm',
      args: "start",
      instances: 1,
      autorestart: true,
      watch: ["src"],
      out_file: "/home/ubuntu/logs/azure_spa_main_out.log",
      error_file: "/home/ubuntu/logs/azure_spa_main_error.log",
      log_file: "/home/ubuntu/logs/azure_spa_main_combined.log",
      time: true,
      env: { // defaults 
        NODE_ENV: 'production',
        API_PORT: 3001,
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        API_PORT: 3001,
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        API_PORT: 3001,
        PORT: 3000
      }
    },
  ],

  deploy: {
    // pm2 deploy ecosystem.config.js azure_spa_main setup
    azure_spa_main: {
      user: 'ubuntu',
      host: ['127.0.0.1'],
      ref: 'origin/main',
      repo: 'git@github.com:ccollins1544/azure-ms-identity-react-spa.git',
      path: '/home/ubuntu/azure_spa_main',
      'pre-deploy-local': 'ls -lash',
      'post-deploy': 'npm install && pm2 startOrRestart /home/ubuntu/ecosystem.config.js --only azure_spa_main --env production',
      'pre-setup': ''
    },
  }
};
