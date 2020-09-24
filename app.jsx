const {
    ButtonGroup, Button, Icon, Grid, IconButton
} = MaterialUI;
(async () => {
    const response = await fetch('dashreq.json');
    const json = await response.json();

    const response2 = await fetch('dashcomputed.json');
    const json2 = await response2.json();

    const names = json.requests.map(j => j.queryName).concat(json2);
    console.log(names);

    let sheetname = new URL(window.location.href).searchParams.get("sheet");
    sheetname = sheetname || 'contagionDataPerCityPublic';
    const fileshow = sheetname === 'all' ? 'out/covid.csv' : `out/csv/${sheetname}.csv`
    console.log(fileshow);

    const CsvLink = ({ name, downloadlink, showlink }) => {
        const showname = name.replace(/(?:^|\.?)([A-Z])/g, function (x, y) { return "_" + y }).replace(/^_/, "").replace(/_/g, " ");
        return <div style={{ margin: 3 }}>
            <ButtonGroup disableElevation variant="contained" color="primary">
                <Button href={showlink} disabled={!showlink}>{showname}</Button>&nbsp;
                <Button href={downloadlink}><Icon>get_app</Icon></Button>
            </ButtonGroup>
        </div>;
    }

    const CsvButtons = ({ names }) => (
        <div>
            <CsvLink key={'xlsx'} name='Xls file' downloadlink='out/covid.xlsx' />
            <CsvLink key={'all'} name='Csv containing all' downloadlink='out/covid.csv' showlink='?sheet=all' />
            {
                names.map(name => (
                    <CsvLink key={name} name={name} downloadlink={`out/csv/${name}.csv`} showlink={`?sheet=${name}`} />
                ))
            }
        </div>
    )

    const DataShow = ({ fileshow }) => {
        const ref = React.useRef()
        React.useEffect(() => {
            console.log(fileshow);
            d3.text(fileshow, function (data) {
                var parsedCSV = d3.csv.parseRows(data);
                // console.log(parsedCSV)

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
            <Grid container direction="row">
                <Grid item xs={3}>
                    <CsvButtons names={names} />
                </Grid>
                <Grid item xs={9}>
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
