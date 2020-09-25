const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

let sheetname = new URL(window.location.href).searchParams.get("sheet");
sheetname = sheetname || 'showcharts';
console.log(sheetname);

const ShowByName = ({ name, names }) => {
    if (name === 'all') return <DataShowRaw fileshow={'out/covid.csv'} />
    if (name === 'showcharts') return <DataShowCharts names={names} />
    return <DataShow name={name} />
}

const App = ({ name }) => {
    const [names, setNames] = React.useState({ names: [], work: true });
    React.useEffect(() => {
        (async () => {
            const response = await fetch('jsons/dashreq.json');
            const json = await response.json();
            let newnames = json.requests.map(j => j.queryName);
            setNames({ names: newnames, work: true });

            const response2 = await fetch('jsons/dashcomputed.json');
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
                <CircularWorkGif work={names.work} />
            </Grid>
            <Grid item xs={9}>
                <ShowByName name={name} names={names.names} />
            </Grid>
        </Grid>
    </>
}

ReactDOM.render(
    <App name={sheetname} />,
    document.getElementById('root')
);
