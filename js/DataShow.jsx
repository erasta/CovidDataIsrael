const {
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableSortLabel,
    CardContent,
    Typography,
    Link
} = MaterialUI;

let popTable = undefined;

const getPopulationTable = async () => {
    if (!popTable) {
        popTable = await fetchCsv('jsons/cbs_city_pop_code.csv');
    }
    return popTable;
}

const convertLT15 = (text) => {
    if (!text.trim) return text;
    const num = parseFloat(text);
    if (Number.isFinite(num)) return num;
    const trimmed = text.trim();
    if (trimmed === 'קטן מ-15') return 14;
    const splitted = trimmed.split('-')
    if (splitted === 2) return (parseFloat(splitted[0]) + parseFloat(splitted[1])) / 2;
    return trimmed;
}

const truncPer10000 = (num) => {
    if (num > 30) return Math.round(num * 10) / 10;
    if (num > 3) return Math.round(num * 100) / 100;
    return Math.round(num * 1000) / 1000;
}

const computeForTable = async (name, data) => {
    if (name === 'testResultsPerDate') {
        data.forEach(row => {
            const amount = parseFloat(row['Amount Virus Diagnosis']);
            const positive = parseFloat(row['Positive Amount']);
            row['Positive Ratio'] = Math.round((amount > 0 ? positive / amount : 0) * 1e6) / 1e6;
        });
    } else if (name === 'contagionDataPerCityPublic') {
        const population = await getPopulationTable();
        if (population) {
            data.forEach(row => {
                const citypop = population.find(poprow => poprow['city'] === row['City']);
                const pop = citypop ? citypop['population'] : 0;
                row['Infected Per 10000'] = pop ? truncPer10000(convertLT15(row['Sick Count']) / pop * 10000) : 0;
                row['Actual Sick Per 10000'] = pop ? truncPer10000(convertLT15(row['Actual Sick']) / pop * 10000) : 0;
                row['Verified Last 7 Days Per 10000'] = pop ? truncPer10000(convertLT15(row['Verified Last7 Days']) / pop * 10000) : 0;
                row['Test Last 7 Days Per 10000'] = pop ? truncPer10000(convertLT15(row['Test Last7 Days']) / pop * 10000) : 0;
                // if (isNaN(row['Verified Last7 Days Per 10000'])) debugger
                row['Population'] = Math.round(pop);
                row['City Code'] = citypop ? citypop['code'] : 0;
            });
        }
    }
    return data;
}

const renameField = (rows, oldname, newname) => {
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

const fixName = (key) => {
    if (key === 'date') return key;
    key = camelCaseToSnake(key).replace(/_/g, " ");
    if (key.toLowerCase().startsWith('count')) {
        key = 'count ' + key.substr(5);
    }
    key = key.split(' ').filter(x => x.length).map(x => x[0].toUpperCase() + x.substr(1)).join(' ');
    return key
}

const fetchTable = async (name, url) => {
    // console.log(name);
    const parsed = await fetchCsv(url);
    if (parsed === undefined) {
        return [];
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
    return await computeForTable(name, parsed);
}

const mergeTablesByDate = (one, two) => {
    if (!one || !one.length || !one[0].date) return two;
    if (!two || !two.length || !two[0].date) return one;
    let dates = one.map(row => row.date).concat(two.map(row => row.date));
    dates.sort((a, b) => a.getTime() - b.getTime());
    dates = dates.filter((d, i) => i === 0 || d.getTime() !== dates[i - 1].getTime());
    const keys = Object.keys(one[0]).concat(Object.keys(two[0])).filter(x => x !== 'date');
    return dates.map(d => {
        let item = { 'date': d };
        keys.forEach(key => item[key] = undefined);
        Object.assign(item, one.find(row => d.getTime() === row.date.getTime()));
        Object.assign(item, two.find(row => d.getTime() === row.date.getTime()));
        return item;
    });
}

const suffixFields = (rows, suffix) => {
    return rows.map(row => {
        const item = { 'date': row.date };
        Object.keys(row).filter(x => x !== 'date').forEach(key => item[key + suffix] = row[key]);
        return item;
    })
}

const tableFileName = (name, historyDate) => {
    if (!historyDate) {
        return `out/csv/${name[0].toLowerCase() + name.substr(1)}.csv`;
    } else {
        return `out/history/${historyDate}/${name[0].toLowerCase() + name.substr(1)}.csv`;
    }
}

const fetchTableAndHistory = async (name, historyDate) => {
    const parsed = await fetchTable(name, tableFileName(name));
    if (!historyDate) return parsed;
    const hist = await fetchTable(name, tableFileName(name, historyDate));
    if (!hist || !hist.length) {
        if (parsed && parsed.length && parsed[0].date) return parsed; // merge with empty
        return []; // no merge
    }
    if (!hist[0].date) return hist;
    const suffixed = suffixFields(hist, '_' + historyDate);
    const merged = mergeTablesByDate(parsed, suffixed);
    return merged;
}

const truncByDateBounds = (data, dateBounds) => {
    if (!dateBounds || dateBounds.length !== 2 || !data || !data.length || !data[0].hasOwnProperty('date')) {
        return data;
    }
    const [dateFrom, dateToInc] = dateBounds;
    return data.filter(row => row['date'] >= dateFrom && row['date'] <= dateToInc);
}

const downloadTable = (name, data) => {
    if (!data || !data.length) return;
    const heads = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(convertToShow).join(','));
    const csv = [heads].concat(rows).join('\n') + '\n';
    const element = document.createElement("a");
    element.href = 'data:text/csv;charset=UTF16-LE,\uFEFF' + encodeURIComponent(csv);
    element.download = name + ".csv";
    element.click();
}

const downloadFile = (name, url) => {
    const element = document.createElement("a");
    element.href = url;
    element.download = name + ".csv";
    // document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}

const DataShowView = ({ name, rows, showtable = true, lang, enforceChart, title, footer }) => {
    return (
        <>
            <Card elevation={3} style={{ margin: 5, padding: 5 }}>
                {!showtable && !rows.length ? null :
                    <>
                        {title ?
                            title :
                            <Link to={`?sheet=${name}`} style={{ textDecoration: 'none' }}>
                                <CardContent style={{ padding: 0 }}>
                                    <Typography variant="h5" component="h5" align='center' style={{ marginBlockEnd: 0 }}>
                                        {trans(lang, name)}
                                    </Typography>
                                </CardContent>
                            </Link>
                        }
                    </>
                }
                <DataGraph parsed={rows} showControls={showtable} enforceChart={enforceChart} />
                {!footer ? null : footer}
                {/* {!showtable ? null :
                    <HistorySlider onHistory={v => setShowHistory(v)} />
                } */}
            </Card>
            {!showtable ? null :
                <>
                    <Grid container direction="row" justify="flex-start" alignItems="stretch">
                        <SplitButton
                            options={[
                                trans(lang, 'Download shown'),
                                trans(lang, 'Download original'),
                            ]}
                            onClick={(option) => {
                                option === 0 ? downloadTable(name, rows) : downloadFile(name + '_orig', `out/csv/${name}.csv`);
                            }}
                        />
                    </Grid>
                    <TableShow parsed={rows} />
                </>
            }
        </>
    )
}

const DataShow = ({ name, showtable = true, lang, enforceChart, title, dateBounds, footer }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    const [showHistory, setShowHistory] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            setState({ parsed: state.parsed, work: true });
            let parsed = await fetchTableAndHistory(name, showHistory);
            parsed = truncByDateBounds(parsed, dateBounds);
            setState({ parsed: parsed, work: false });
        })();
    }, [name, showHistory])
    return (
        <>
            <CircularWorkGif work={state.work} />
            <DataShowView
                name={name}
                rows={state.parsed}
                showtable={showtable}
                lang={lang}
                enforceChart={enforceChart}
                title={title}
                footer={
                        <>
                            {footer}
                        {!showtable ? null :
                            <HistorySlider onHistory={v => setShowHistory(v)} />
                        }
                    </>
                }
            />
        </>
    )
}
