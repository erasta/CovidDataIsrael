const {
    ButtonGroup, Button, Icon, Grid
} = MaterialUI;
(async () => {
    const response = await fetch('dashreq.json');
    const json = await response.json();
    const names = json.requests.map(j => j.queryName);
    console.log(names);

    let sheetname = new URL(window.location.href).searchParams.get("sheet");
    sheetname = sheetname || 'contagionDataPerCityPublic';
    const fileshow = sheetname === 'all' ? 'out/covid.csv' : `out/csv/${sheetname}.csv`
    console.log(fileshow);

    const CsvLink = ({ name, downloadlink, showlink }) => {
        const showname = name.replace(/(?:^|\.?)([A-Z])/g, function (x, y) { return " " + y }).replace(/^_/, "");
        return <div>
            <ButtonGroup disableElevation color="primary">
                <Button href={showlink} disabled={!showlink}>{showname}</Button>&nbsp;
                <Button href={downloadlink}><Icon>get_app</Icon></Button>
            </ButtonGroup>
        </div>;
    }

    const CsvButtons = ({ names }) => (
        <>
            <CsvLink key={'xlsx'} name='Xls file' downloadlink='out/covid.xlsx' />
            <CsvLink key={'all'} name='Csv containing all' downloadlink='out/covid.csv' showlink='?sheet=all' />
            {
                names.map(name => <CsvLink name={name} key={name} downloadlink={`out/csv/${name}.csv`} showlink={`?sheet=${name}`} />)
            }
        </>
    )

    const DataShow = ({ fileshow }) => {
        const ref = React.useRef()
        React.useEffect(() => {
            console.log(fileshow);
            d3.text(fileshow, function (data) {
                var parsedCSV = d3.csv.parseRows(data);
                console.log(parsedCSV)

                var container = d3.select(ref.current)
                container.html('')

                container.append("table")

                    .selectAll("tr")
                    .data(parsedCSV).enter()
                    .append("tr")

                    .selectAll("td")
                    .data(function (d) { return d; }).enter()
                    .append("td")
                    .text(function (d) { return d; });
            });
        }, [])
        return (
            <div
                ref={ref}
            />
        )
    }

    const App = ({ names, fileshow }) => (
        <>
            <Grid container>
                <Grid item xs={3}>
                    <CsvButtons names={names} />
                </Grid>
                <Grid item>
                    <DataShow fileshow={fileshow} />
                </Grid>
            </Grid>
        </>
    )

    ReactDOM.render(
        <App names={names} fileshow={fileshow} />,
        document.getElementById('root')
    );
})();
