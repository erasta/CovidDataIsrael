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
                                        {convertToShow(convertToType(row[column]))}
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

const fetchCsv = async (url) => {
    const data = await (await fetch(url)).text();
    if (data.split('\n', 1)[0].trim() === "<!DOCTYPE html>") {
        return undefined;
    }
    return d3.csv.parse(data);
}

const fetchTable = async (name) => {
    console.log(name);
    const parsed = await fetchCsv(`out/csv/${name[0].toLowerCase() + name.substr(1)}.csv`);
    if (parsed === undefined) {
        return [];
    }
    return computeForTable(name, parsed);
}

const DataShow = ({ name, showtable = true }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    React.useEffect(() => {
        (async () => {
            setState({ parsed: [], work: true });
            const parsed = await fetchTable(name);
            setState({ parsed: parsed, work: false });
        })();
    }, [name])
    return (
        <>
            {!showtable && !state.parsed.length ? null :
                <a href={`?sheet=${name}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ marginBlockEnd: 0 }}>
                        {name[0].toUpperCase() + name.substr(1)}
                    </h2>
                </a>
            }
            <CircularWorkGif work={state.work} />
            <DataGraph parsed={state.parsed} />
            {!showtable ? null :
                <TableShow parsed={state.parsed} />
            }
        </>
    )
}

