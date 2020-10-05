const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const CsvLink = ({ name, showlink, lang }) => (
    <div style={{ margin: 3 }}>
        <ButtonGroup disableElevation variant="contained" color="primary">
            <Button component={Link} to={showlink} disabled={!showlink}>{trans(lang, name)}</Button>
        </ButtonGroup>
    </div>
)

const CsvButtons = ({ names, lang }) => (
    <div>
        <CsvLink key={'showcharts'} name='ShowCharts' showlink='?sheet=showcharts' lang={lang} />
        <CsvLink key={'infectedVsDead'} name='infectedVsDead' showlink='?sheet=infectedVsDead' lang={lang} />
        {
            names.map(name => (
                <CsvLink key={name} name={name} showlink={`?sheet=${name}`} lang={lang} />
            ))
        }
    </div>
)

