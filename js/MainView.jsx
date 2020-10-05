const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const ShowByName = ({ name, names, lang }) => {
    if (name === 'ShowCharts') return <DataShowCharts names={names} lang={lang} />
    if (name === 'infectedVsDead') return <DataShowComputedDeath showtable={true} lang={lang} />
    return <DataShow name={name} lang={lang} />
}

const CsvButtons = ({ names, lang, language, setLanguage }) => (
    <Grid container direction='column'>
        <Button
            key={'lang'}
            style={{ margin: 3 }}
            variant="contained"
            color="primary"
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
        >
            <Grid container direction='row' justify="center" spacing={1}>
                <Grid item>
                    <img width={24} height={24} src={`images/${language === 'he' ? 'il' : 'gb'}.svg`}></img>
                </Grid>
                <Grid item>
                    Change language
                </Grid>
            </Grid>
        </Button>
        {
            ['ShowCharts', 'infectedVsDead'].concat(names).map(name => (
                <Button
                    key={name}
                    component={Link}
                    to={`?sheet=${name}`}
                    style={{ margin: 3 }}
                    variant="contained"
                    color="primary"
                >
                    {trans(lang, name)}
                </Button>
            ))
        }
    </Grid>
)


const MainView = ({ names, name, lang, language, setLanguage, showSideBar }) => (
    <Grid container direction="row">
        <Grid item xs={showSideBar ? 9 : 12}>
            <ShowByName name={name} names={names} lang={lang} />
        </Grid>
        {
            !showSideBar ? null :
                <Grid item xs={3}>
                    <CsvButtons names={names} lang={lang} language={language} setLanguage={setLanguage} />
                </Grid>
        }
    </Grid>
)