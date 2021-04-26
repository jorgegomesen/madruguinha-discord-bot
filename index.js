const fs = require('fs');
const Discord = require('discord.js');
const PlayersData = require('./data');
const client = new Discord.Client();
const prefix = '#';

client.commands = new Discord.Collection();

var http = require('http');
http.createServer(function (req, res) {
    res.write("I'm alive");
    res.end();
}).listen(8080);

client.on('ready', () => {
    console.log('Your Bot is now Online.')

    let activities = [`gang shit`, `with the gang`, `with the gang`], i = 0;

    setInterval(() => client.user.setActivity(`${activities[i++ % activities.length]}`, {
        type: "STREAMING",
        url: "https://www.youtube.com/watch?v=DWcJFNfaw9c"
    }), 5000);
});


const commands_files = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.js'));

var past_players_data = [];
var current_players_data = [];
var is_watching = null;

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

    try {
        switch (command) {
            case 'watch':
                var param_1 = args[0] ? args[0] : null;
                var Command = client.commands.get(command);

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

                await message.channel.send('```diff\n+ Monitoramento encerrado!```');
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
                await message.channel.send('```diff\n- Comando inválido!\n+ Digite !help para saber sobre quais comandos são permitidos.```');
        }
    } catch (error) {
        console.error(error);
        await message.reply('Erro ao executar o comando!');
    }
});

client.login(process.env.TOKEN);

function wait(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
