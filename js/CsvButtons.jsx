const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const CsvLink = ({ name, downloadlink, showlink }) => {
    const showname = name.replace(/(?:^|\.?)([A-Z])/g, function (x, y) { return "_" + y }).replace(/^_/, "").replace(/_/g, " ");
    return <div style={{ margin: 3 }}>
        <ButtonGroup disableElevation variant="contained" color="primary">
            <Button href={showlink} disabled={!showlink}>{showname}</Button>
            {downloadlink ?
                <Button href={downloadlink}><Icon>get_app</Icon></Button>
                : null}
        </ButtonGroup>
    </div>;
}

const CsvButtons = ({ names }) => (
    <div>
        <CsvLink key={'showcharts'} name='ShowCharts'  showlink='?sheet=showcharts'/>
        {
            names.map(name => (
                <CsvLink key={name} name={name} downloadlink={`out/csv/${name}.csv`} showlink={`?sheet=${name}`} />
            ))
        }
        {names.length ? <hr></hr> : null}
        <CsvLink key={'xlsx'} name='Xls file' downloadlink='out/covid.xlsx' />
        <CsvLink key={'all'} name='Csv containing all' downloadlink='out/covid.csv' showlink='?sheet=all' />
    </div>
)

