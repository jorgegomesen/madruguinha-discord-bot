/*
/** Manter bot ativo
*/
// const http = require('http');
// const express = require('express');
// const app = express();
// app.get("/", (request, response) => {
//     console.log(Date.now() + " Ping Received");
//     response.sendStatus(200);
// });
// app.listen(process.env.PORT);
// setInterval(() => {
//     http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
// }, 280000);
/**/


const fs = require('fs');
const Discord = require('discord.js');
const PlayersData = require('./data');
const prefix = '!';

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commands_files = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.js'));

let past_players_data = [];
let current_players_data = [];
let is_watching = null;

for (const file of commands_files) {
    const command = require(__dirname + `/commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('I\'m online!');
    console.log('I\'m online!');
});

client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // if (!client.commands.has(command)) return;

    try {
        switch (command) {
            case 'watch':
                let param_1 = args[0] ? args[0] : null;
                let Command = client.commands.get(command);

                if (param_1 === 'stop') {
                    is_watching = false;
                    break;
                }

                if (!param_1 || !/(https:).*(guest.php).*/g.test(param_1.toString())) {
                    message.channel.send('```diff\n- Não foi especificada uma url válida para página de ranking.```');
                    break;
                }

                is_watching = true;

                let players_data = new PlayersData(param_1);

                while (is_watching) {
                    current_players_data = await players_data.getFormattedData();
                    Command.execute(message, param_1, current_players_data, past_players_data);
                    await wait(10000);
                }

                message.channel.send('```diff\n+ Monitoramento encerrado!```');
                break;
            case 'history':
                client.commands.get(command).execute(message, args, past_players_data);
                break;
            case 'help':
            case 'intro':
            case 'ping':
                client.commands.get(command).execute(message, args);
                break;
            case 'clear':
                past_players_data = [];
                break;
            default:
                message.channel.send('```diff\n- Comando inválido!\n+ Digite !help para saber sobre quais comandos são permitidos.```');
        }
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(process.env.TOKEN);
// client.login('NzEzNzQ0MTY0MDgwMDU4NDk4.XskkDQ.6WS3V36_aT_srQkpRVJmIXLa460');

function wait(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
