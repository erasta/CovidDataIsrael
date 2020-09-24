const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

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

