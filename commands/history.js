module.exports = {
    name: 'history',
    description: 'Information about specific player',
    execute(message, args, past_players_data) {
        let player = args.join(' ');

        if (!player) {
            message.channel.send('```diff\n- Não foi informado o nick do jogador.```');
            return;
        }

        if (past_players_data[player] && past_players_data[player].history) {
            let text = '```diff\n* ' + player + ' - ' + past_players_data[player].points + '\n';
            text += past_players_data[player].history.join('\n') + '```';

            message.channel.send(text);
            return;
        }

        message.channel.send('```diff\n- Jogador não encontrado.```');
    }
}