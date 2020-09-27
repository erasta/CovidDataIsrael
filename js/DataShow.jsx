const {
    Paper, TableContainer, Table, TableHead, TableRow, TableBody, TableCell, TableSortLabel
} = MaterialUI;

const TableShow = ({ parsed }) => {
    const [order, setOrder] = React.useState({ by: null, asc: 'asc' });
    React.useEffect(() => {
        if (parsed && parsed.length && parsed[0].hasOwnProperty('date')) {
            setOrder({ by: 'date', asc: 'desc' });
        }
    }, [parsed])
    const columns = parsed.length ? Object.keys(parsed[0]) : [];
    const rows = sortBy(parsed, order.by, order.asc === 'asc');
    return (
        <Paper >
            <TableContainer style={{ maxHeight: 1000 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, i) => (
                                <TableCell
                                    style={{ backgroundColor: 'lightgrey' }}
                                    key={i}
                                >
                                    <TableSortLabel
                                        active={order.by === column}
                                        direction={order.by === column ? order.asc : 'asc'}
                                        onClick={(event) => {
                                            const property = event.target.textContent;
                                            const isAsc = order.by === property && order.asc === 'asc';
                                            setOrder({ by: property, asc: isAsc ? 'desc' : 'asc' })
                                        }}
                                    >
                                        {column}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, ridx) => (
                            <TableRow
                                key={ridx}
                            >
                                {columns.map((column, cidx) => (
                                    <TableCell key={cidx}>
                                        {convertToShow(row[column])}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}

const computeForTable = (name, data) => {
    if (name === 'testResultsPerDate') {
        data.forEach(row => {
            const amount = parseFloat(row['amount']);
            const positive = parseFloat(row['positiveAmount']);
            row['positiveRatio'] = '' + Math.round((amount > 0 ? positive / amount : 0) * 1e6) / 1e6;
        });
    }
    return data;
}

const fetchTable = async (name, url) => {
    console.log(name);
    const parsed = await fetchCsv(url);
    if (parsed === undefined) {
        return [];
    }
    return computeForTable(name, parsed);
}

const mergeTablesByDate = (one, two) => {
    if (!one || !one.length || !one[0].date) return two;
    if (!two || !two.length || !two[0].date) return one;
    let dates = one.map(row => row.date).concat(two.map(row => row.date));
    dates.sort((a, b) => a.getTime() - b.getTime());
    dates = dates.filter((d, i) => i === 0 || Math.abs(d.getTime() - dates[i - 1].getTime()) < 1);
    const keys = Object.keys(one[0]).concat(Object.keys(two[0])).filter(x => x !== 'date');
    return dates.map(d => {
        let item = { 'date': d };
        keys.forEach(key => item[key] = undefined);
        Object.assign(item, one.find(row => Math.abs(d.getTime() - row.date.getTime()) < 1));
        Object.assign(item, two.find(row => Math.abs(d.getTime() - row.date.getTime()) < 1));
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

const fetchTableAndHistory = async (name, historyDate) => {
    const parsed = await fetchTable(name, `out/csv/${name[0].toLowerCase() + name.substr(1)}.csv`);
    if (!historyDate) return parsed;
    const hist = await fetchTable(name, `out/history/${historyDate}/${name[0].toLowerCase() + name.substr(1)}.csv`);
    if (!hist || !hist.length || !hist[0].date) return parsed;
    const suffixed = suffixFields(hist, '_' + historyDate);
    console.log(suffixed)
    const merged = mergeTablesByDate(parsed, suffixed);
    console.log(merged)
    return merged;
}

const DataShow = ({ name, showtable = true }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    const [showHistory, setShowHistory] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            setState({ parsed: [], work: true });
            const parsed = await fetchTableAndHistory(name, showHistory);
            setState({ parsed: parsed, work: false });
        })();
    }, [name, showHistory])
    return (
        <>
            {!showtable && !state.parsed.length ? null :
                <a href={`?sheet=${name}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ marginBlockEnd: 0 }}>
                        {name[0].toUpperCase() + name.substr(1)}
                    </h2>
                </a>
            }
            <HistorySlider onHistory={v => setShowHistory(v)} />
            <CircularWorkGif work={state.work} />
            <DataGraph parsed={state.parsed} />
            {!showtable ? null :
                <TableShow parsed={state.parsed} />
            }
        </>
    )
}

