const ShowByName = ({ name, names, lang }) => {
    if (name === 'showcharts') return <DataShowCharts names={names} lang={lang} />
    if (name === 'infectedVsDead') return <DataShowComputedDeath showtable={true} lang={lang} />
    return <DataShow name={name} lang={lang} />
}

const MainView = ({ names, name, lang }) => (
    <Grid container direction="row">
        <Grid item xs={3}>
            <CsvButtons names={names} lang={lang} />
        </Grid>
        <Grid item xs={9}>
            <ShowByName name={name} names={names} lang={lang} />
        </Grid>
    </Grid>
)