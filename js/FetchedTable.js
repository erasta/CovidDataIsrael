class FetchedTable {
    constructor(name, historyDate) {
        this.name = name;
        this.historyDate = historyDate;
        this.data = [];
    }

    async doFetch(url) {
        let parsed = await fetchCsv(url);
        if (parsed === undefined) {
            if (name !== 'sickPatientPerLocation') {
                return [];
            }
            const url2 = url.replace('sickPatientPerLocation', 'sickPerLocation');
            parsed = await fetchCsv(url2);
            if (parsed === undefined) {
                return [];
            }
        }
        renameField(parsed, 'תאריך', 'date');
        renameField(parsed, 'Date', 'date');
        if (parsed.length) {
            if (parsed[0].hasOwnProperty('date')) {
                parsed.sort((a, b) => a.date.getTime() - b.date.getTime());
            }
        }
        Object.keys(parsed[0]).forEach(key => {
            renameField(parsed, key, fixName(key));
        });
        this.data = await computeForTable(name, parsed);
        return this;
    }
}