const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const CsvLink = ({ name, downloadlink, showlink, lang }) => {
    // const showname = camelCaseToSnake(name).replace(/_/g, " ");
    return <div style={{ margin: 3 }}>
        <ButtonGroup disableElevation variant="contained" color="primary">
            <Button component={Link} to={showlink} disabled={!showlink}>{trans(lang, name)}</Button>
            {downloadlink ?
                <Button href={downloadlink}><Icon>get_app</Icon></Button>
                : null}
        </ButtonGroup>
    </div>;
}

const CsvButtons = ({ names, lang }) => (
    <div>
        <CsvLink key={'showcharts'} name='ShowCharts' showlink='?sheet=showcharts' lang={lang} />
        <CsvLink key={'infectedVsDead'} name='infectedVsDead' showlink='?sheet=infectedVsDead' lang={lang} />
        {
            names.map(name => (
                <CsvLink key={name} name={name} downloadlink={`out/csv/${name}.csv`} showlink={`?sheet=${name}`} lang={lang} />
            ))
        }
    </div>
)

