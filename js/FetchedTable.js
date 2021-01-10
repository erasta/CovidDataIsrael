class FetchedTable {
    constructor(name, historyDate) {
        this.name = name;
        this.historyDate = historyDate;
        this.time = onlyDay(this.historyDate ? new Date(this.historyDate) : new Date());
        this.noRecursion = false;
        this.data = [];
    }

    clone() {
        return JSON.parse(JSON.stringify(this));
    }

    suffixFields(suffix) {
        this.data = this.data.map(row => {
            const item = row.date ? { 'date': row.date } : {};
            const keys = Object.keys(row).filter(x => x !== 'date');
            keys.forEach(key => {
                item[key + suffix] = row[key]
            });
            return item;
        });
        return this;
    }

    hasDate() {
        return this.data.length && this.data[0].date;
    }

    keys(withDate) {
        let dataKeys = this.data.length ? Object.keys(this.data[0]) : [];
        return withDate ? dataKeys : dataKeys.filter(k => k !== 'date');
    }

    mergeByDate(other) {
        if (!this.hasDate()) return other;
        if (!other.hasDate()) return this;
        let dates = this.data.map(row => row.date).concat(this.data.map(row => row.date));
        dates.sort((a, b) => a.getTime() - b.getTime());
        dates = dates.filter((d, i) => i === 0 || d.getTime() !== dates[i - 1].getTime());
        const keys = this.keys(true).concat(other.keys(false));
        this.data = dates.map(d => {
            let item = { 'date': d };
            keys.forEach(key => item[key] = undefined);
            Object.assign(item, this.data.find(row => d.getTime() === row.date.getTime()));
            Object.assign(item, other.data.find(row => d.getTime() === row.date.getTime()));
            return item;
        });
        return this;
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

    paramstr() {
        return JSON.stringify([this.name, this.historyDate, this.noRecursion]);
    }

    getFromCache() {
        if (!FetchedTable.cache || FetchedTable.cache.length > 100) {
            FetchedTable.cache = {};
        }
        const dug = FetchedTable.cache[this.paramstr()];
        if (!dug) return undefined;
        if (new Date() - dug.last > 5 * 60 * 1000) return undefined;
        this.data = dug.data;
        return this;
    }

    async doFetch() {
        if (this.getFromCache()) return this;
        this.data = await this.doFetchOnAltNames();
        this.renameField(this.data, 'תאריך', 'date');
        this.renameField(this.data, 'Date', 'date');
        this.renameField(this.data, 'Day_Date', 'date');
        if (this.data.length) {
            if (this.data[0].hasOwnProperty('date')) {
                this.data.sort((a, b) => a.date.getTime() - b.date.getTime());
            }
            Object.keys(this.data[0]).forEach(key => {
                this.renameField(this.data, key, this.fixName(key));
            });
        }
        await new SpecificTableCompute().work(this);
        FetchedTable.cache[this.paramstr()] = { last: new Date(), data: this.data };
        return this;
    }
}