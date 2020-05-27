module.exports = {
    name: 'alert',
    description: 'Make an alert',
    execute(message, building) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            message.channel.send("```diff\n+ Você precisa estar em um canal de voz!```");
            return;
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);

        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            message.channel.send("```diff\n+ Preciso de permissões para entrar e falar no seu canal!```");
            return;
        }

        voiceChannel.join().then(connection => {
            // Yay, it worked!
            let dispatcher;

            switch (building) {
                case 'ferreiro18':
                    dispatcher = connection.play('../alerts/ferreiro18.mp3');
                    break;
                case 'ferreiro19':
                    dispatcher = connection.play('../alerts/ferreiro19.mp3');
                    break;
                case 'academia':
                    dispatcher = connection.play('../alerts/academia.mp3');
                    break;
                case 'demolido':
                    dispatcher = connection.play('../alerts/demolido.mp3');
            }

            dispatcher.on('finish', () => voiceChannel.leave());
            dispatcher.on('error', () => message.channel.send('```diff\n- Não foi possível fazer o alerta!```'));
        }).catch(e => {
            // Oh no, it errored! Let's log it to console :)
            console.error(e);
        });
    }
}