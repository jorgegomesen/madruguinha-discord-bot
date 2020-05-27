module.exports = {
    name: 'intro',
    description: 'Introduction about the bot',
    execute(message, args){
        message.channel.send('```diff\n+ Sou o madruguinha e gosto de usar bot\'s para tudo.```');
    }
}