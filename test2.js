const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const Mailparser = require('mailparser').MailParser;
const base64 = require('js-base64');
const cheerio = require('cheerio');
const axios = require('axios');
const convert = require('xml-js');

var email_arrived_at = null;
var server_url = null;
var coords = null;
var landing_time = null;
var player_name = null;

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// The file credentials.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './aaaa/token.json';

server_url = 'https://enc4.tribalwars.net/';
const UNIT_CONFIG = await getTroopsConfig();

const UNITS = [
    'spear',
    'sword',
    'axe',
    'spy',
    'light',
    'heavy',
    'ram',
    'catapult',
    'snob',
];

const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

function calcDistance(to, from) {
    const target = to.split('|').map((ele) => parseInt(ele));
    const source = from.split('|').map((ele) => parseInt(ele));
    return Math.sqrt(
        Math.pow(source[0] - target[0], 2) + Math.pow(source[1] - target[1], 2)
    );
}

async function getTroopsConfig() {
    const resp = await axios.get(
        server_url + '/interface.php?func=get_unit_info'
    );
    // console.log(resp);
    // console.log(resp.data);
    const data = JSON.parse(
        convert.xml2json(resp.data, {compact: true, spaces: 2})
    );
    return data['config'];
}

function calcUnitDuration(source, target, unit) {
    const distance = calcDistance(target, source);
    const unit_speed = parseFloat(UNIT_CONFIG[unit].speed._text);
    return Math.round((distance * unit_speed * (1000 * 60)) / 1000);
}

function getUnitsDurations(source, target, duration) {
    let units= UNITS.map((unit) => [
        unit,
        calcUnitDuration(source, target, unit),
    ]);
    duration = strTimeToSecs(duration);
    console.log(duration);
    console.log(units);
    units = units.sort((a, b) => {
        if (Math.abs(duration - a[1]) < Math.abs(duration - b[1])) return -1;

        if (Math.abs(a[1] - duration) > Math.abs(b[1] - duration)) return 1;

        // names must be equal
        return 0;
    });
    console.log(units);
    console.log('\n\n\n');
    return units;
}

function findBestUnit(source, target, duration) {
    const units_duration = getUnitsDurations(source, target, duration);

    return units_duration[0];
}

function strTimeToSecs(str_time) {
    str_time = str_time.split(':').map((ele) => parseInt(ele));
    return str_time[0] * 3600 + str_time[1] * 60 + str_time[2];
}

function secsToTime(secs) {
    let dur_h = parseInt(secs / 3600);
    let dur_m = parseInt((secs % 3600) / 60);
    let dur_s = parseInt((secs % 3600) % 60);

    dur_h = (dur_h + '').length < 2 ? '0' + dur_h : dur_h;
    dur_m = (dur_m + '').length < 2 ? '0' + dur_m : dur_m;
    dur_s = (dur_s + '').length < 2 ? '0' + dur_s : dur_s;

    return `${dur_h}:${dur_m}:${dur_s}`;
}

function calcDuration(at, lt) {
    at = strTimeToSecs(at);
    lt = strTimeToSecs(lt);

    const duration_s = at - lt;
    // let dur_h = parseInt(duration_s / 3600);
    // let dur_m = parseInt((duration_s % 3600) / 60);
    // let dur_s = parseInt((duration_s % 3600) % 60);

    // dur_h = (dur_h + '').length < 2 ? '0' + dur_h : dur_h;
    // dur_m = (dur_m + '').length < 2 ? '0' + dur_m : dur_m;
    // dur_s = (dur_s + '').length < 2 ? '0' + dur_s : dur_s;

    return secsToTime(duration_s);
}

function getMail(msgId, auth) {
    console.log('msgId', msgId);
    const gmail = google.gmail({version: 'v1', auth});
    //This api call will fetch the mailbody.
    gmail.users.messages.get(
        {
            userId: 'me',
            id: msgId,
        },
        (err, res) => {
            // console.log(res.data.labelIds.INBOX)
            if (!err) {
                // console.log("no error")
                // console.log(res.data.payload);

                let body = res.data.payload.body.data;

                if (!body) body = res.data.payload.parts[0].body.data;

                let htmlBody = base64.decode(
                    body.replace(/-/g, '+').replace(/_/g, '/')
                );

                // console.log('htmlbody', htmlBody)

                let headers = res.data.payload.headers;
                email_arrived_at = headers[headers.length - 2].value;

                if (!/[0-9]{2}\:[0-9]{2}\:[0-9]{2}/.test(email_arrived_at))
                    email_arrived_at = headers[headers.length - 5].value;

                // date = htmlBody.match(/Date.+[0-9]{2}\:[0-9]{2}/g);
                //'https://brc1.tribalwars.com.br'
                server_url = htmlBody.match(/https:\/\/.+(?=\/game.php?)/g)[0];
                //['421|441', '408|454']
                coords = htmlBody.match(/[0-9]{3}\|[0-9]{3}/g);
                //'23:13:35'
                landing_time = htmlBody.match(
                    /\([0-9]{3}\|[0-9]{3}\).+[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g
                );

                if (landing_time)
                    landing_time = landing_time[0].match(/[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g);

                player_name = htmlBody
                    .match(/(Hello).+\!/g)[0]
                    .split(' ')
                    .slice(1)
                    .join(' ');
                player_name = player_name.split('!')[0];

                // console.log(data.text);
                console.log(email_arrived_at);
                console.log(server_url);
                console.log(coords);
                console.log(landing_time);
                console.log('\n');

                var mailparser = new Mailparser();

                mailparser.on('end', (err, res) => {
                    console.log('res', res);
                });

                // mailparser.on('data', (dat) => {
                //     if (dat.type === 'text') {
                //         const $ = cheerio.load(dat.textAsHtml);
                //         var links = [];
                //         var modLinks = [];
                //         $('a').each(function (i) {
                //             links[i] = $(this).attr('href');
                //         });
                //
                //         //Regular Expression to filter out an array of urls.
                //         var pat = /------[0-9]-[0-9][0-9]/;
                //
                //         //A new array modLinks is created which stores the urls.
                //         modLinks = links.filter(li => {
                //             if (li.match(pat) !== null) {
                //                 return true;
                //             } else {
                //                 return false;
                //             }
                //         });
                //         console.log('modlinks', modLinks);
                //
                //         //This function is called to open all links in the array.
                //
                //     }
                // })

                mailparser.write(htmlBody);
                mailparser.end();
            }
        }
    );
}

function listMessages(auth) {
    console.log('LisMessages');
    return new Promise((resolve, reject) => {
        const gmail = google.gmail({version: 'v1', auth});
        gmail.users.messages.list(
            {
                userId: 'me',
                labelIds: ['UNREAD'],
                maxResults: 5,
            },
            async (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!res.data.messages) {
                    resolve([]);
                    return;
                }
                resolve(res.data);

                console.log('Iterate over messages');

                let message;

                for (let mail of res.data.messages) {
                    message = ``;
                    getMail(mail.id, auth);
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: mail.id,
                        removeLabelIds: ['UNREAD'],
                    });

                    message += `Notification arrived at **__${email_arrived_at}__**\n`;

                    let coords_length = coords.length;
                    let duration = null;
                    let match_unit = null;
                    const launch_time = email_arrived_at.match(
                        /[0-9]{2}\:[0-9]{2}\:[0-9]{2}/g
                    )[0];

                    for (let it = 0, it_l = 0; it < coords_length; it += 2, it_l++) {
                        duration = calcDuration(landing_time[it_l], launch_time);
                        match_unit = findBestUnit(coords[it], coords[it + 1], duration);
                        message += `**${coords[it]}** --> **${
                            coords[it + 1]
                        }** arriving at **${
                            landing_time[it_l]
                        }** \t\t\t Duration: **${duration}** \t\t Match unit: **${
                            match_unit[0]
                        }** - **${secsToTime(
                            match_unit[1]
                        )}** \t\t Target: **${player_name}**\n`;
                    }

                    await lib.discord.channels['@0.0.6'].messages.create({
                        channel_id: context.params.event.channel_id,
                        content: '\n\n' + message,
                    });

                    await sleep(2000);
                }
            }
        );
    });
}

console.log('Got hereeee');
// Load client secrets from a local file.
fs.readFile('./aaaa/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    // const {client_secret, client_id, javascript_origins} = JSON.parse(content).web;

    console.log(`Got here: A`);
    authorize(JSON.parse(content), listMessages);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.labels.list(
        {
            userId: 'me',
        },
        (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const labels = res.data.labels;
            if (labels.length) {
                console.log('Labels:');
                labels.forEach((label) => {
                    console.log(`- ${label.name}`);
                });
            } else {
                console.log('No labels found.');
            }
        }
    );
}

await sleep(30000);
// .then(process.exit.bind(process, 0));
