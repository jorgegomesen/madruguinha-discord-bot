module.exports = {
    name: 'alert',
    description: 'Make an alert',
    execute(message, building) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            message.channel.send("```diff\n+ You need to be in a voice channel!```");
            return;
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);

        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            message.channel.send("```diff\n+ I need permissions to join and speak in your channel!```");
            return;
        }

        voiceChannel.join().then(connection => {
            // Yay, it worked!
            let dispatcher;

            switch (building) {
                case 'ferreiro18':
                    dispatcher = connection.play('./alerts/ferreiro18.mp3');
                    break;
                case 'ferreiro19':
                    dispatcher = connection.play('./alerts/ferreiro19.mp3');
                    break;
                case 'academia':
                    dispatcher = connection.play('./alerts/academia.mp3');
                    break;
                case 'demolido':
                    dispatcher = connection.play('./alerts/demolido.mp3');
            }

            // dispatcher.on('finish', () => voiceChannel.leave());
            dispatcher.on('error', () => message.channel.send('```diff\n- Wasn\'t possible to make an alert!```'));
        }).catch(e => {
            // Oh no, it errored! Let's log it to console :)
            console.error(e);
        });
    }
}