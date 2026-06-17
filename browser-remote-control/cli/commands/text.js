const { Command } = require('commander');
const chalk = require('chalk');
const apiClient = require('../lib/api-client');

const text = new Command('text')
  .description('Get the text content of the current page')
  .action(async (opts, command) => {
    const server = command.parent?.opts?.()?.server || process.env.BROWSER_CLI_SERVER || 'http://localhost:3000';
    try {
      const result = await apiClient.getText(server);
      console.log(result.data.text);
    } catch (err) {
      console.error(chalk.red('Failed to get text:'), err.message);
      process.exit(1);
    }
  });

module.exports = text;
