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
    const dates = strDates.map(row => new Date(row));
    const invalidDates = dates.filter(x => isNaN(x.getTime()));
    if (invalidDates.length > 0) {
        return [[], []];
    }
    const checkedfields = Object.keys(parsed[0]).filter(key => key !== 'date');
    const numfields = checkedfields.filter(key => {
        const nums = parsed.map(row => parseFloat(row[key].trim()));
        const nans = nums.filter(isNaN);
        return nans.length === 0;
    })
    const numitems = numfields.map(key => {
        return parsed.map(row => parseFloat(row[key].trim()));
    })
    return [numitems, numfields, dates];
}

const DataGraph = ({ parsed }) => {
    const [numitems, numfields, dates] = extractDateAndNumbers(parsed);
    console.log(numitems)
    let data = {}
    if (numfields.length) {
        data = {
            labels: dates.map(d => d.toLocaleDateString()),
            datasets: numitems.map((field, i) => {
                const color = new Array(3).fill().map(() => '' + Math.floor(Math.random() * 256)).join(',')
                return {
                    label: numfields[i],
                    backgroundColor: 'rgba(' + color + ',0.2)',
                    borderColor: 'rgba(' + color + ',1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(' + color + ',0.4)',
                    hoverBorderColor: 'rgba(' + color + ',1)',
                    data: field,
                }
            })
        };
    }
    return (
        numfields.length === 0 ? null :
            <ReactChartjs2.Line
                data={data}
            />
    )
}

const DataShow = ({ fileshow, name }) => {
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
            <h2>{name[0].toUpperCase() + name.substr(1)}</h2>
            <CircularWorkGif work={state.work} />
            <DataGraph parsed={state.parsed} />
            <TableFromObjects parsed={state.parsed} />
        </>
    )
}
