#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const apiClient = require('../lib/api-client');
const navigateCmd = require('../commands/navigate');
const contentCmd = require('../commands/content');
const textCmd = require('../commands/text');
const clickCmd = require('../commands/click');

program
  .name('browser-cli')
  .description('CLI tool for remote browser control')
  .version('1.0.0')
  .option('-s, --server <url>', 'Server URL', 'http://localhost:3000');

program.addCommand(navigateCmd);
program.addCommand(contentCmd);
program.addCommand(textCmd);
program.addCommand(clickCmd);

program.command('plugins')
  .description('List connected browser plugins')
  .action(async () => {
    const server = program.opts().server;
    try {
      const result = await apiClient.getPlugins(server);
      if (result.data && result.data.length > 0) {
        console.log(chalk.green('Connected plugins:'));
        result.data.forEach(p => {
          console.log(`  - ${p.id} (${p.browserInfo.name || 'Unknown'}) - ${p.status}`);
        });
      } else {
        console.log(chalk.yellow('No plugins connected'));
      }
    } catch (err) {
      console.error(chalk.red('Error:'), err.message);
      process.exit(1);
    }
  });

program.parse();
