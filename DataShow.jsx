const {
    HorizontalGridLines,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis,
    LineMarkSeries
} = reactVis;

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

const extractDateAndNumbers = (parsed) => {
    if (!parsed.length || !Object.keys(parsed[0]).includes('date')) {
        return [[], []];
    }
    parsed = parsed.filter(row => row['date'].trim() !== '');
    const strDates = parsed.map(row => row['date'].trim());
    const invalidDates = strDates.filter(x => isNaN(new Date(x).getTime()));
    if (invalidDates.length > 0) {
        return [[], []];
    }
    const checkedfields = Object.keys(parsed[0]).filter(key => key !== 'date');
    const numfields = checkedfields.filter(key => {
        const nums = parsed.map(row => parseFloat(row[key].trim()));
        const nans = nums.filter(isNaN);
        return nans.length === 0;
    })
    const extracted = parsed.map(row => {
        const newrow = { 'date': row['date'].trim() };
        numfields.forEach(key => { newrow[key] = row[key].trim() });
        return newrow;
    });
    return [extracted, numfields];
}

const DataGraph = ({ parsed }) => {
    const [extracted, numfields] = extractDateAndNumbers(parsed);
    const data = numfields.map(field => {
        return extracted.map(row => {
            return { x: new Date(row['date']).getTime(), y: parseFloat(row[field]) };
        })
    });
    return (
        numfields.length === 0 || extracted.length === 0 ? null :
            <XYPlot
                margin={60}
                width={700}
                height={400}
            >
                <XAxis
                    tickFormat={t => new Date(t).toLocaleDateString()}
                    tickLabelAngle={-45}
                />
                <YAxis />
                <HorizontalGridLines />
                {/* <VerticalGridLines /> */}
                {
                    data.map((datafield, i) =>
                        <reactVis.LineSeries
                            key={i}
                            data={datafield}
                            sizeRange={[5, 15]}
                        />
                    )
                }
            </XYPlot>
    )
}

const DataShow = ({ fileshow }) => {
    const [state, setState] = React.useState({ parsed: [], work: true });
    React.useEffect(() => {
        (async () => {
            setState({ parsed: [], work: true });
            console.log(fileshow);
            const data = await (await fetch(fileshow)).text();
            const parsed = d3.csv.parse(data);
            setState({ parsed: parsed, work: false });
        })();
    }, [fileshow])
    return (
        <>
            <CircularWorkGif work={state.work} />
            <DataGraph parsed={state.parsed} />
            <TableFromObjects parsed={state.parsed} />
        </>
    )
}
