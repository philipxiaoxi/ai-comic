const { Command } = require('commander');
const chalk = require('chalk');
const apiClient = require('../lib/api-client');

const navigate = new Command('navigate')
  .description('Navigate browser to a URL')
  .requiredOption('-u, --url <url>', 'URL to navigate to')
  .option('-t, --tab-id <id>', 'Optional tab ID')
  .action(async (opts) => {
    const server = process.env.BROWSER_CLI_SERVER || 'http://localhost:3000';
    try {
      console.log(chalk.blue(`Navigating to: ${opts.url}`));
      const result = await apiClient.navigate(server, opts.url, opts.tabId);
      console.log(chalk.green('Navigation successful'));
      console.log(JSON.stringify(result.data, null, 2));
    } catch (err) {
      console.error(chalk.red('Navigation failed:'), err.message);
      process.exit(1);
    }
  });

module.exports = navigate;
