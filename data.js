const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);

class PlayersData {
    constructor(url) {
        this._url = url;
        this._axios = require('axios');
    }
    getData() {
        return this._axios.get(this._url);
    }
    getTableHtml(response) {
        return $(response.data).find('#player_ranking_table');
    }
    getFormattedData() {
        return new Promise(async (resolve, reject) => {
            let requested_data = await this.getData();
            let tableHtml = this.getTableHtml(requested_data);
            let rows = $(tableHtml).find('tr');
            let rows_length = rows.length;
            let name = '';
            let points = 0;
            let data = []

            for (let it = 1; it < rows_length; it++) {
                name = $(rows[it]).find('td:eq(1)').text().trim();
                points = $(rows[it]).find('td:eq(3)').text().trim();
                data[name] = points.replace('.', '');
            }

            resolve(data);
        })

    }

}

module.exports = PlayersData;