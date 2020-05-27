module.exports = {
    name: 'watch',
    description: 'Watch speed ranking',
    execute(message, watch_url, current_players_data, past_players_data) {
        const play_alert_module = require('./alert');
        let buildings = require('../buildings.json');

        function updatePastPlayersData() {
            let keys = Object.keys(current_players_data);

            for (let key of keys) {
                if (!past_players_data[key] || !past_players_data[key].points) {
                    past_players_data[key] = {};
                    past_players_data[key].history = [];
                }
                past_players_data[key].points = current_players_data[key];
            }
        }

        function updatePastPlayersHistory(key, action) {
            if (past_players_data[key].history.length > 20)
                past_players_data[key].history.shift();
            past_players_data[key].history.push(action);
        }

        function main() {
            let final_string = '';
            let string;
            let keys = Object.keys(current_players_data);
            let diff = 0;
            let demolished = false;

            for (let key of keys) {
                if (!past_players_data[key])
                    continue;

                diff = parseInt(current_players_data[key]) - parseInt(past_players_data[key].points);

                string = '';
                string += '* ' + key + ' =>\t';
                string += past_players_data[key].points + '\t' + current_players_data[key] + '\n';

                if (diff < 0) {
                    final_string += string + '- [ demolido ]\n';
                    demolished = true;
                }

                let demolish_css = demolished ? '- ' : '+ ';
                diff = Math.abs(diff);

                if (!demolished)
                    switch (diff) {
                        case 71:
                            play_alert_module.execute(message, 'ferreiro18');
                            break;
                        case 84:
                            play_alert_module.execute(message, 'ferreiro19');
                            break;
                        case 512:
                            play_alert_module.execute(message, 'academia');
                    }

                if (buildings[diff]) {
                    let string_aux = '[' + buildings[diff].join(' ou ') + ']';

                    final_string += demolished ? '' : string;
                    final_string += demolish_css + string_aux + '\n';
                    updatePastPlayersHistory(key, demolish_css + string_aux);
                    demolished = false;
                    continue;
                }

                if (diff > 512 && diff < 700) {
                    final_string += demolished ? '' : string;
                    final_string += demolish_css + '[ ACADEMIA 1 ]\n';
                    updatePastPlayersHistory(key, demolish_css + '[ ACADEMIA 1 ]');
                    play_alert_module.execute(message, 'academia');
                }
                demolished = false;
            }

            updatePastPlayersData();

            let speed_info = '** Speed sendo monitorado => ' + watch_url + ' **\n\n';

            final_string = final_string.length ? speed_info + final_string : 'Nenhuma atualização identificada.';

            message.channel.send('```diff\n' + final_string + '```');
        }

        main();
    }
}