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
var active_servers = [];

for (const file of commands_files) {
    const command = require(__dirname + `/commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('I\'m online!');
});

client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    const server_id = message.channel.guild.id;

    console.log(`O comando ${command} foi executado no servidor ${message.channel.guild.name} por ${message.author.username}`);

    /*if(!current_players_data[server_id])
        current_players_data[server_id] = [];

    if(!past_players_data[server_id])
        past_players_data[server_id] = [];*/

    try {
        switch (command) {
            case 'watch':
                let param_1 = args[0] ? args[0] : null;
                let Command = client.commands.get(command);
                let is_watching = true;

                if (param_1 === 'stop') {
                    is_watching = false;
                    active_servers[server_id] = false;
                    break;
                }
                
                active_servers[server_id] = true;

                if (!param_1 || !/(https:).*(guest.php).*/g.test(param_1.toString())) {
                    message.channel.send('```diff\n- Not a valid url.```');
                    break;
                }

                let players_data = new PlayersData(param_1);

                while (is_watching && active_servers[server_id]) {
                    current_players_data = await players_data.getFormattedData();
                    Command.execute(message, param_1, current_players_data, past_players_data);
                    await wait(5000);
                }

                message.channel.send('```diff\n+ Speed monitoring is over!```');
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
                message.channel.send('```diff\n- Invalid command!\n+ Type #help to know all the allowed commands.```');
        }
    } catch (error) {
        console.error(error);
        message.reply('Error executing that command!');
    }
});

client.login(process.env.TOKEN);

function wait(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
