module.exports = {
    name: 'help',
    description: 'Show available commands.',
    execute(message, args) {
        let msg = '```diff\n';
        msg += '+ COMANDOS\n\n';
        msg += '+ !intro - introdução ao bot\n';
        msg += '+ !help - lista de comandos\n';
        msg += '+ !watch page_url - iniciar o monitoramento do speed\n';
        msg += '+ !watch stop - encerrar monitoramento do speed\n';
        msg += '+ !history nickplayer - histórico de up do jogador em específico\n';
        msg += '+ !clear - limpar dados\n';
        msg += '```';

        message.channel.send(msg);
    }
}