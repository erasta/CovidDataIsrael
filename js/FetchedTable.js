class FetchedTable {
    constructor(name, historyDate) {
        this.name = name;
        this.historyDate = historyDate;
        this.time = onlyDay(this.historyDate ? new Date(this.historyDate) : new Date());
        this.data = [];
    }

    clone() {
        return JSON.parse(JSON.stringify(this));
    }

    async doFetchOtherDate(otherDate) {
        return (await new FetchedTable(this.name, otherDate).doFetch());
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
        await this.computeForTable();
        return this;
    }

    async computeForTable() {
        if (this.name === 'testResultsPerDate') {
            this.data.forEach((row, i) => {
                const amount = parseFloat(row['Amount Virus Diagnosis']);
                const positive = parseFloat(row['Positive Amount']);
                row['Positive Ratio'] = Math.round((amount > 0 ? positive / amount : 0) * 1e6) / 1e6;
                row['R'] = this.computeR(i, row);
            });
        } else if (this.name === 'contagionDataPerCityPublic') {
            const population = await getPopulationTable();
            if (population) {
                this.data.forEach(row => {
                    const citypop = population.find(poprow => poprow['city'] === row['City']);
                    const pop = citypop ? citypop['population'] : 0;
                    const test7 = convertLT15(row['Test Last7 Days']);
                    row['Verified/Tests ratio'] = !test7 ? 0 : convertLT15(row['Verified Last7 Days']) / test7;
                    row['Infected Per 10000'] = normalizeToPop(pop, row['Sick Count']);
                    row['Actual Sick Per 10000'] = normalizeToPop(pop, row['Actual Sick']);
                    row['Verified Last 7 Days Per 10000'] = normalizeToPop(pop, row['Verified Last7 Days']);
                    row['Test Last 7 Days Per 10000'] = normalizeToPop(pop, row['Test Last7 Days']);
                    row['Population'] = Math.round(pop);
                    row['City Code'] = citypop ? citypop['code'] : 0;
                    delete row['Patient Diff Population For Ten Thousands'];
                });
            }
        }
    }

    computeR(i, row) {
        const currDate = onlyDay(row['date']);
        let sumThisWeek = 0;
        let sumLastWeek = 0;
        let j = i;
        for (; j >= 0 && dayDiff(currDate, onlyDay(this.data[j]['date'])) < 7.1; --j) {
            sumThisWeek += (this.data[j]['Positive Amount'] ?? 0);
        }
        for (; j >= 0 && dayDiff(currDate, onlyDay(this.data[j]['date'])) < 14.1; --j) {
            sumLastWeek += (this.data[j]['Positive Amount'] ?? 0);
        }
        if (!sumLastWeek) return 0;
        return sumThisWeek / sumLastWeek;
    }
}