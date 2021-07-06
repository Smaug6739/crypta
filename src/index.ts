import { Telegraf } from 'telegraf';
import { readFileSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch'

const toml = require('toml');
let config: any = null;
try {
	config = toml.parse(readFileSync(join(__dirname, '../config.toml')));
} catch (e: any) {
	console.error("Parsing error on line " + e.line + ", column " + e.column +
		": " + e.message);
}

const bot = new Telegraf(config.token)
bot.command('ping', (ctx) => ctx.reply('Pong !'))
bot.command('info', async (ctx) => {
	const args = ctx.message.text.split(' ')
	args.shift()
	if (!config.alloweds.includes(args[0])) return ctx.reply(`Unsuported crypto. Suported cryptos are : ${config.alloweds.join(', ')}`)
	console.log('OK');
	console.log(args);

	const responce = await fetch(config.rootPrices.replace('{{CRYPTO}}', args![0]))
	if (!responce || responce.status >= 300) return ctx.reply('An error occurred please try again.');
	const result = await responce.json()
	if (result[args[0]]) {
		ctx.reply(`EUR : ${result[args[0]].EUR}€\nUSD : ${result[args[0]].USD}$`)
	}
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))