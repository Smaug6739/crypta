"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const fs_1 = require("fs");
const path_1 = require("path");
const node_fetch_1 = __importDefault(require("node-fetch"));
const toml = require('toml');
let config = null;
try {
    config = toml.parse(fs_1.readFileSync(path_1.join(__dirname, '../config.toml')));
}
catch (e) {
    console.error("Parsing error on line " + e.line + ", column " + e.column +
        ": " + e.message);
}
const bot = new telegraf_1.Telegraf(config.token);
bot.command('ping', (ctx) => ctx.reply('Pong !'));
bot.command('info', async (ctx) => {
    const args = ctx.message.text.split(' ');
    args.shift();
    if (!config.alloweds.includes(args[0]))
        return ctx.reply(`Unsuported crypto. Suported cryptos are : ${config.alloweds.join(', ')}`);
    console.log('OK');
    console.log(args);
    const responce = await node_fetch_1.default(config.rootPrices.replace('{{CRYPTO}}', args[0]));
    if (!responce || responce.status >= 300)
        return ctx.reply('An error occurred please try again.');
    const result = await responce.json();
    if (result[args[0]]) {
        ctx.reply(`EUR : ${result[args[0]].EUR}€\nUSD : ${result[args[0]].USD}$`);
    }
});
bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
