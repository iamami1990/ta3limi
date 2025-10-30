module.exports = {
  apps: [
    {
      name: 'ta3limi',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=ta3limi-production --r2=ta3limi-files --kv=auth --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
