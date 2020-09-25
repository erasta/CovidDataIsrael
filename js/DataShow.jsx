const TableFromObjects = ({ parsed }) => {
    const ref = React.useRef()
    React.useEffect(() => {
        const container = d3.select(ref.current)
        container.html('')
        if (parsed.length) {
            const columns = Object.keys(parsed[0]);
            // The table generation function
            var table = container.append("table"),
                thead = table.append("thead"),
                tbody = table.append("tbody");

            // append the header row
            thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                .text(function (column) { return column; });

            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(parsed)
                .enter()
                .append("tr");

            // create a cell in each row for each column
            rows.selectAll("td")
                .data(function (row) {
                    return columns.map(function (column) {
                        return { column: column, value: row[column] };
                    });
                })
                .enter()
                .append("td")
                .attr("style", "font-family: Courier") // sets the font style
                .html(function (d) { return d.value; });
        }
    }, [parsed])
    return <div
        ref={ref}
    />
}

const DataShow = ({ name, showtable = true }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    React.useEffect(() => {
        (async () => {
            setState({ parsed: [], work: true });
            console.log(name);
            const data = await (await fetch(`out/csv/${name}.csv`)).text();
            const parsed = d3.csv.parse(data);
            setState({ parsed: parsed, work: false });
        })();
    }, [name])
    return (
        <>
            {!showtable && !state.parsed.length ? null :
                <h2>{name[0].toUpperCase() + name.substr(1)}</h2>
            }
            <CircularWorkGif work={state.work} />
            <DataGraph parsed={state.parsed} />
            {!showtable ? null :
                <TableFromObjects parsed={state.parsed} />
            }
        </>
    )
}

const DataShowCharts = ({ names }) => (
    <>
        <DataShow
            key={'patientsPerDate'}
            name={'patientsPerDate'}
            showtable={false}
        />
        <Grid container>
            {[
                'infectedPerDate',
                'deadPatientsPerDate',
                'recoveredPerDay',
                'testResultsPerDate',
                'doublingRate',
                'calculatedVerified',
                'deadWeekly_computed',
                'deadDelta_computed'
            ].map(name =>
                <Grid item xs={6}>
                    <DataShow
                        key={name}
                        name={name}
                        showtable={false}
                    />
                </Grid>
            )}
        </Grid>
    </>
)
