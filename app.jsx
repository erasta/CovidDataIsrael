const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

let sheetname = new URL(window.location.href).searchParams.get("sheet");
sheetname = sheetname || 'contagionDataPerCityPublic';
const fileshow = sheetname === 'all' ? 'out/covid.csv' : `out/csv/${sheetname}.csv`
console.log(sheetname, fileshow);

const ShowByName = ({ fileshow, name }) => {
    if (name === 'all') return <DataShowRaw fileshow={fileshow} name={name} />
    if (name === 'showcharts') return <DataShow fileshow={fileshow} name={name} />
    return <DataShow fileshow={fileshow} name={name} />
}

const App = ({ fileshow, name }) => {
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
                <CircularWorkGif work={names.work} />
            </Grid>
            <Grid item xs={9}>
                <ShowByName fileshow={fileshow} name={name} />
            </Grid>
        </Grid>
    </>
}

ReactDOM.render(
    <App fileshow={fileshow} name={sheetname} />,
    document.getElementById('root')
);
