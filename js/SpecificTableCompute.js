class SpecificTableCompute {
    async work(table) {
        this.table = table;
        if (this.table.name === 'testResultsPerDate') {
            this.comp_testResultsPerDate();
        } else if (this.table.name === 'contagionDataPerCityPublic') {
            await this.comp_contagionDataPerCityPublic();
        }
    }

    comp_testResultsPerDate() {
        this.table.data.forEach((row, i) => {
            const amount = parseFloat(row['Amount Virus Diagnosis']);
            const positive = parseFloat(row['Positive Amount']);
            row['Positive Ratio'] = Math.round((amount > 0 ? positive / amount : 0) * 1e6) / 1e6;
            row['R'] = this.computeR(i, row);
        });
    }

    async comp_contagionDataPerCityPublic() {
        const WEEK = 7 * 24 * 3600 * 1000;
        const population = await getPopulationTable();
        if (population) {
            const back1week = new FetchedTable(this.table.name, toIsoDate(new Date(this.table.time.getTime() - WEEK)));
            const back2week = new FetchedTable(this.table.name, toIsoDate(new Date(this.table.time.getTime() - WEEK * 2)));
            back1week.noRecursion = back2week.noRecursion = true;
            if (!this.table.noRecursion) {
                await back1week.doFetch();
                await back2week.doFetch();
            }
            this.table.data.forEach(row => {
                const citypop = population.find(poprow => poprow['city'] === row['City']);
                const citycode = citypop ? citypop['code'] : 0;
                const pop = citypop ? citypop['population'] : 0;
                const test7 = convertLT15(row['Test Last7 Days']);
                row['Verified/Tests ratio'] = !test7 ? 0 : convertLT15(row['Verified Last7 Days']) / test7;
                row['Infected Per 10000'] = normalizeToPop(pop, row['Sick Count']);
                row['Actual Sick Per 10000'] = normalizeToPop(pop, row['Actual Sick']);
                row['Verified Last 7 Days Per 10000'] = normalizeToPop(pop, row['Verified Last7 Days']);
                row['Test Last 7 Days Per 10000'] = normalizeToPop(pop, row['Test Last7 Days']);
                if (!this.table.noRecursion) {
                    const city1week = !back1week ? undefined : back1week.data.find(c => c['City Code'] === citycode);
                    const city2week = !back2week ? undefined : back2week.data.find(c => c['City Code'] === citycode);
                    row['Actual Sick Per 10000, 1 week ago'] = !city1week ? undefined : city1week['Actual Sick Per 10000'];
                    row['Actual Sick Per 10000, 2 week ago'] = !city2week ? undefined : city2week['Actual Sick Per 10000'];
                    row['Verified Last 7 Days Per 10000, 1 week ago'] = !city1week ? undefined : city1week['Verified Last 7 Days Per 10000'];
                    row['Verified Last 7 Days Per 10000, 2 week ago'] = !city2week ? undefined : city2week['Verified Last 7 Days Per 10000'];
                    row['Ramzor by Verified'] = this.ramzorVerified(
                        row['Verified Last 7 Days Per 10000'],
                        row['Verified Last 7 Days Per 10000, 1 week ago'],
                        row['Test Last 7 Days Per 10000']
                    );
                    row['Ramzor by Actual Sick'] = this.ramzorActualSick(
                        row['Verified Last 7 Days Per 10000'],
                        row['Actual Sick Per 10000'],
                        row['Actual Sick Per 10000, 1 week ago'],
                        row['Actual Sick Per 10000, 2 week ago']
                    );
                }
                row['Population'] = Math.round(pop);
                row['City Code'] = citycode;
                delete row['Patient Diff Population For Ten Thousands'];
            });
        }
    }

    computeR(i, row) {
        const currDate = onlyDay(row['date']);
        let sumThisWeek = 0;
        let sumLastWeek = 0;
        let j = i;
        for (; j >= 0 && dayDiff(currDate, onlyDay(this.table.data[j]['date'])) < 6.1; --j) {
            sumThisWeek += (this.table.data[j]['Positive Amount'] ?? 0);
        }
        for (; j >= 0 && dayDiff(currDate, onlyDay(this.table.data[j]['date'])) < 13.1; --j) {
            sumLastWeek += (this.table.data[j]['Positive Amount'] ?? 0);
        }
        if (!sumLastWeek) return 0;
        return sumThisWeek / sumLastWeek;
    }

    ramzorVerified(verifiedLast7Per10000, verifiedLast7Per10000WeekAgo, testsLast7DaysPer10000) {
        if (verifiedLast7Per10000 === undefined || verifiedLast7Per10000WeekAgo === undefined || testsLast7DaysPer10000 === undefined) {
            return undefined;
        }
        if (verifiedLast7Per10000WeekAgo < 0.00001 || testsLast7DaysPer10000 < 0.00001) {
            return undefined;
        }
        const k = 2;
        const m = 8;
        const N = verifiedLast7Per10000;
        const G = verifiedLast7Per10000 / verifiedLast7Per10000WeekAgo;
        const P = verifiedLast7Per10000 / testsLast7DaysPer10000;
        const NGG = N * G * G;
        if (NGG < 0.0000000001) return 0;
        const ramzor_raw = k + Math.log(NGG) + P / m;
        return Math.round(Math.min(10, Math.max(0, ramzor_raw)) * 100) / 100;
    }

    ramzorActualSick(positivesThisWeek, sickThisWeek, sickLastWeek, sick2WeekAgo) {
        if (positivesThisWeek === undefined || sickThisWeek === undefined || sickLastWeek === undefined || sick2WeekAgo === undefined) {
            return undefined;
        }
        const k = 2;
        const m = 8;
        const N = sickThisWeek - sickLastWeek;
        const N1 = sickLastWeek - sick2WeekAgo;
        if (N1 === 0) {
            return undefined;
        }
        const G = N / N1;
        const NGG = N * G * G;
        if (NGG < 0.0000000001) return 0;
        const ramzor_raw = k + Math.log(NGG) + positivesThisWeek / m;
        return Math.round(Math.min(10, Math.max(0, ramzor_raw)) * 100) / 100;
    }

}