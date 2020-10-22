class FetchedTable {
    constructor(name, historyDate) {
        this.name = name;
        this.historyDate = historyDate;
        this.data = [];
    }

    tableFileName(name, historyDate) {
        if (!historyDate) {
            return `out/csv/${name[0].toLowerCase() + name.substr(1)}.csv`;
        } else {
            return `out/history/${historyDate}/${name[0].toLowerCase() + name.substr(1)}.csv`;
        }
    }

    altTableNames() {
        if (this.name === 'sickPatientPerLocation') return ['sickPatientPerLocation', 'sickPerLocation'];
        return [this.name];
    }

    async doFetchOnAltNames() {
        const names = this.altTableNames();
        for (let i = 0; i < names.length; ++i) {
            const url = this.tableFileName(names[i], this.historyDate);
            const parsed = await fetchCsv(url);
            if (parsed !== undefined) return parsed;
        }
        return [];
    }

    renameField(rows, oldname, newname) {
        if (rows.length) {
            if (!rows[0].hasOwnProperty(newname) && rows[0].hasOwnProperty(oldname)) {
                rows.forEach(row => {
                    row[newname] = row[oldname];
                    delete row[oldname];
                })
            }
        }
        return rows;
    }

    fixName(key) {
        if (key === 'date') return key;
        key = camelCaseToSnake(key).replace(/_/g, " ");
        if (key.toLowerCase().startsWith('count')) {
            key = 'count ' + key.substr(5);
        }
        key = key.split(' ').filter(x => x.length).map(x => x[0].toUpperCase() + x.substr(1)).join(' ');
        return key
    }


    async doFetch() {
        this.data = await this.doFetchOnAltNames();
        this.renameField(this.data, 'תאריך', 'date');
        this.renameField(this.data, 'Date', 'date');
        if (this.data.length) {
            if (this.data[0].hasOwnProperty('date')) {
                this.data.sort((a, b) => a.date.getTime() - b.date.getTime());
            }
            Object.keys(this.data[0]).forEach(key => {
                this.renameField(this.data, key, this.fixName(key));
            });
        }
        this.data = await computeForTable(this.name, this.data);
        return this;
    }
}