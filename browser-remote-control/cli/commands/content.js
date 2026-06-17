const { Command } = require('commander');
const chalk = require('chalk');
const apiClient = require('../lib/api-client');

const content = new Command('content')
  .description('Get the HTML content of the current page')
  .action(async () => {
    const server = process.env.BROWSER_CLI_SERVER || 'http://localhost:3000';
    try {
      const result = await apiClient.getContent(server);
      console.log(result.data.html);
    } catch (err) {
      console.error(chalk.red('Failed to get content:'), err.message);
      process.exit(1);
    }
  });

module.exports = content;
