const { Command } = require('commander');
const chalk = require('chalk');
const apiClient = require('../lib/api-client');

const click = new Command('click')
  .description('Click an element on the page')
  .requiredOption('-s, --selector <selector>', 'CSS selector of the element')
  .option('-t, --tab-id <id>', 'Optional tab ID')
  .action(async (opts, command) => {
    const server = command.parent?.opts?.()?.server || process.env.BROWSER_CLI_SERVER || 'http://localhost:3000';
    try {
      console.log(chalk.blue(`Clicking element: ${opts.selector}`));
      const result = await apiClient.click(server, opts.selector, opts.tabId);
      console.log(chalk.green('Click successful'));
      console.log(JSON.stringify(result.data, null, 2));
    } catch (err) {
      console.error(chalk.red('Click failed:'), err.message);
      process.exit(1);
    }
  });

module.exports = click;
