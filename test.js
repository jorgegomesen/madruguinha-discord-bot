const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

var Imap = require('imap'),
    inspect = require('util').inspect;
const MailParser = require('mailparser').MailParser;
const bluebird = require('bluebird');

var imap = bluebird.promisifyAll(
    new Imap({
        user: 'seu.madrugada.bot.discord@gmail.com',
        password: '80jzKY2g#mBs',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
    })
);

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

var date = 'opa';
var server_url = null;
var coords = null;
var landing_time = null;

console.log(`Got here: A`);

imap.once('ready', function () {
    console.log(`Ready`);
    imap
        .openInboxAsync('INOBX', true)
        .then(() => {
            imap
                .searchAsync(['UNSEEN'])
                .then((results) => {
                    var f = imap.fetchAsync(results, {
                        bodies: '',
                    });

                    f.on('message', function (msg, seqno) {
                        console.log('Processing msg #' + seqno);
                        var parser = new MailParser();
                        parser.on('headers', function (headers) {
                            console.log('Header: ' + JSON.stringify(headers));
                        });
                        parser.on('data', (data) => {
                            if (data.type === 'text') {
                                // console.log(seqno);
                                //'Date: seg., 15 de nov. de 2021 às 22:32'
                                date = data.text.match(/Date.+[0-9]{2}\:[0-9]{2}/g);
                                //'https://brc1.tribalwars.com.br'
                                server_url = data.text.match(/https:\/\/.+(?=\/game.php?)/g)[0];
                                //['421|441', '408|454']
                                coords = data.text.match(/[0-9]{3}\|[0-9]{3}/g);
                                //'23:13:35'
                                landing_time = data.text.match(
                                    /\([0-9]{3}\|[0-9]{3}\).+[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g
                                );

                                if (landing_time)
                                    landing_time = landing_time[0].match(
                                        /[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g
                                    )[0];
                                console.log(data.text);
                                console.log(date);
                                console.log(server_url);
                                console.log(coords);
                                console.log(landing_time);
                                console.log('\n');
                            }
                        });
                        msg.on('body', function (stream) {
                            stream.on('data', function (chunk) {
                                parser.write(chunk.toString('utf8'));
                            });
                        });
                        msg.once('end', function () {
                            // console.log("Finished msg #" + seqno);
                            parser.end();
                        });
                        // console.log('Message #%d', seqno);
                        // var prefix = '(#' + seqno + ') ';
                        // msg.on('body', function(stream, info) {
                        //     var buffer = '';
                        //     stream.on('data', function(chunk) {
                        //         buffer += chunk.toString('utf8');
                        //     });
                        //     stream.once('end', function() {
                        //         console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                        //     });
                        // });
                        // msg.once('attributes', function(attrs) {
                        //     console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                        // });
                        // msg.once('end', function() {
                        //     console.log(prefix + 'Finished');
                        // });
                    });
                    f.once('error', function (err) {
                        console.log('Fetch error: ' + err);
                    });
                    f.once('end', function () {
                        console.log('Done fetching all messages!');
                        imap.end();
                    });
                })
                .catch((error) => console.log('Error search'));
        })
        .catch((error) => console.log('error open', error));

    // openInbox(function (err, box) {
    // console.log(`Open inbox`);
    // if (err) console.log(err);
    // //'HEADER.FIELDS (FROM TO SUBJECT DATE)',
    // imap.search(['UNSEEN'], function (err, results) {
    // if (err) {
    // console.log(err);
    // return;
    // }
    // var f = imap.fetch(results, {
    // bodies: '',
    // });
    // f.on('message', function (msg, seqno) {
    // console.log('Processing msg #' + seqno);
    // var parser = new MailParser();
    // parser.on('headers', function (headers) {
    // console.log('Header: ' + JSON.stringify(headers));
    // });
    // parser.on('data', (data) => {
    // if (data.type === 'text') {
    // // console.log(seqno);
    // //'Date: seg., 15 de nov. de 2021 às 22:32'
    // date = data.text.match(/Date.+[0-9]{2}\:[0-9]{2}/g);
    // //'https://brc1.tribalwars.com.br'
    // server_url = data.text.match(/https:\/\/.+(?=\/game.php?)/g)[0];
    // //['421|441', '408|454']
    // coords = data.text.match(/[0-9]{3}\|[0-9]{3}/g);
    // //'23:13:35'
    // landing_time = data.text.match(
    // /\([0-9]{3}\|[0-9]{3}\).+[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g
    // );

    // if (landing_time)
    // landing_time = landing_time[0].match(
    // /[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g
    // )[0];
    // console.log(data.text);
    // console.log(date);
    // console.log(server_url);
    // console.log(coords);
    // console.log(landing_time);
    // console.log('\n');
    // }
    // });
    // msg.on('body', function (stream) {
    // stream.on('data', function (chunk) {
    // parser.write(chunk.toString('utf8'));
    // });
    // });
    // msg.once('end', function () {
    // // console.log("Finished msg #" + seqno);
    // parser.end();
    // });
    // console.log('Message #%d', seqno);
    // var prefix = '(#' + seqno + ') ';
    // msg.on('body', function(stream, info) {
    //     var buffer = '';
    //     stream.on('data', function(chunk) {
    //         buffer += chunk.toString('utf8');
    //     });
    //     stream.once('end', function() {
    //         console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
    //     });
    // });
    // msg.once('attributes', function(attrs) {
    //     console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
    // });
    // msg.once('end', function() {
    //     console.log(prefix + 'Finished');
    // });
    // });
    // f.once('error', function (err) {
    // console.log('Fetch error: ' + err);
    // });
    // f.once('end', function () {
    // console.log('Done fetching all messages!');
    // imap.end();
    // });
//     });
// });
});

imap.once('error', function (err) {
    console.log(err);
});

imap.once('end', function () {
    console.log('Connection ended');
});

imap.connect();

await lib.discord.channels['@0.0.6'].messages.create({
    channel_id: context.params.event.channel_id,
    content: [
        `<@!${context.params.event.member.user.id}> just triggered the **/incomings-status** command!`,
        date,
        server_url,
        coords,
        landing_time,
    ].join('\n'),
});

// Write some custom code here
