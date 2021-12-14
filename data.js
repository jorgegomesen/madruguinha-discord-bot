// const {JSDOM} = require("jsdom");
// const {window} = new JSDOM("");
// const $ = require("jquery")(window);
// const Imap = require('imap');
// const Promise = require('bluebird');
// const MailParser = require("mailparser").MailParser;
//
// class PlayersData {
//     constructor(url) {
//         this._url = url;
//         this._axios = require('axios');
//     }
//
//     getData() {
//         return this._axios.get(this._url);
//     }
//
//     getTableHtml(response) {
//         return $(response.data).find('#player_ranking_table');
//     }
//
//     getFormattedData() {
//         return new Promise(async (resolve, reject) => {
//             let requested_data = await this.getData();
//             let tableHtml = this.getTableHtml(requested_data);
//             let rows = $(tableHtml).find('tr');
//             let rows_length = rows.length;
//             let name = '';
//             let points = 0;
//             let data = []
//
//             for (let it = 1; it < rows_length; it++) {
//                 name = $(rows[it]).find('td:eq(1)').text().trim();
//                 points = $(rows[it]).find('td:eq(3)').text().trim();
//                 data[name] = points.replace('.', '');
//             }
//
//             resolve(data);
//         })
//
//     }
//
// }
//
// // mail = seu.madrugada.bot.discord@gmail.com
// // pw = 80jzKY2g#mBs
//
// class IncomingsNotifications {
//     constructor(mail_user, mail_pw, mail_host, mail_port, mail_tls) {
//         this.mail = {
//             user: mail_user,
//             password: mail_pw,
//             host: mail_host,
//             port: mail_port,
//             tls: mail_tls
//         };
//         this.imap = new Imap(this.mail);
//     }
//
//     connect() {
//         Promise.promisifyAll(this.imap);
//
//         this.imap.once("ready", this.verifyInboxMails);
//         this.imap.once("error", function (err) {
//             // log.error("Connection error: " + err.stack);
//             console.log("Connection error: " + err.stack);
//         });
//
//         this.imap.connect();
//     }
//
//     verifyInboxMails() {
//         let imap = this.imap;
//         let class_instance = this;
//
//         imap.openBox("INBOX", false, function (err, mailBox) {
//             if (err) {
//                 console.error(err);
//                 return;
//             }
//             imap.search(["UNSEEN"], function (err, results) {
//                 if (!results || !results.length) {
//                     console.log("No unread mails");
//                     imap.end();
//                     return;
//                 }
//
//                 let f = imap.fetch(results, {bodies: ""});
//
//                 f.on("message", class_instance.processMail);
//                 f.once("error", function (err) {
//                     return Promise.reject(err);
//                 });
//                 f.once("end", function () {
//                     console.log("Done fetching all unseen messages.");
//                     imap.end();
//                 });
//             });
//         });
//     }
//
//     processMail(msg, seqno) {
//         console.log("Processing msg #" + seqno);
//         // console.log(msg);
//
//         let parser = new MailParser();
//         parser.on("headers", function (headers) {
//             console.log("Header: " + JSON.stringify(headers));
//         });
//
//         parser.on('data', data => {
//             if (data.type === 'text') {
//                 console.log(seqno);
//                 console.log(data.text);  /* data.html*/
//             }
//
//             // if (data.type === 'attachment') {
//             //     console.log(data.filename);
//             //     data.content.pipe(process.stdout);
//             //     // data.content.on('end', () => data.release());
//             // }
//         });
//
//         msg.on("body", function (stream) {
//             stream.on("data", function (chunk) {
//                 parser.write(chunk.toString("utf8"));
//             });
//         });
//         msg.once("end", function () {
//             // console.log("Finished msg #" + seqno);
//             parser.end();
//         });
//     }
// }
//
// module.exports = PlayersData;