const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

let sheetname = new URL(window.location.href).searchParams.get("sheet");
sheetname = sheetname || 'contagionDataPerCityPublic';
const fileshow = sheetname === 'all' ? 'out/covid.csv' : `out/csv/${sheetname}.csv`
console.log(fileshow);

const checkAllKeysAreSame = (data) => {
    return data.length && data.find(d => Object.keys(d) === Object.keys(data[0]));
}

const DataShow = ({ fileshow }) => {
    const [work, setWork] = React.useState(true);
    const ref = React.useRef()
    React.useEffect(() => {
        (async () => {
            setWork(true);
            const container = d3.select(ref.current)
            container.html('')
            console.log(fileshow);
            const data = await (await fetch(fileshow)).text();
            if (fileshow === 'out/covid.csv') {
                const parsedCSV = d3.csv.parseRows(data);
                container.append("table")
                    .selectAll("tr")
                    .data(parsedCSV).enter()
                    .append("tr")
                    .selectAll("td")
                    .data(function (d) { return d; }).enter()
                    .append("td")
                    .text(function (d) { return d; });
            } else {
                const parsedCSV = d3.csv.parse(data);
                if (parsedCSV.length) {
                    const columns = Object.keys(parsedCSV[0]);
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
                        .data(parsedCSV)
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
            }
            setWork(false);
        })();
    }, [])
    return (
        <>
            {work ? <img src='android-spinner.gif' width='150'></img> : null}
            <div
                ref={ref}
            />
        </>
    )
}

const App = ({ fileshow }) => {
    const [names, setNames] = React.useState({ names: [], work: true });
    React.useEffect(() => {
        (async () => {
            const response = await fetch('dashreq.json');
            const json = await response.json();
            let newnames = json.requests.map(j => j.queryName);
            setNames({ names: newnames, work: true });

            const response2 = await fetch('dashcomputed.json');
            const json2 = await response2.json();
            newnames = newnames.concat(json2)

            setNames({ names: newnames, work: false });
            console.log(newnames);
        })();
    }, []);

    return <>
        <Grid container direction="row">
            <Grid item xs={3}>
                <CsvButtons names={names.names} />
                {names.work ? <img src='android-spinner.gif' width='150'></img> : null}
            </Grid>
            <Grid item xs={9}>
                <DataShow fileshow={fileshow} />
            </Grid>
        </Grid>
    </>
}

ReactDOM.render(
    <App fileshow={fileshow} />,
    document.getElementById('root')
);
