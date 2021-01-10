const DataShowCharts = ({ lang, names }) => (
    <>
        <HeaderWidget lang={lang} />
        <Grid container key={'chartGrid'} direction="row" justify="center" alignItems="stretch">
            {[
                'patientsPerDate',
                'moh_corona_medical_staff',
                'infectedPerDate',
                'deadPatientsPerDate',
                'recoveredPerDay',
                'vaccinated',
                'testResultsPerDate',
                'moh_corona_hospitalization',
                'moh_corona_isolation_per_day',
                'doublingRate',
            ].map(name =>
                <Grid item xs={6} key={name}
                    style={{ minWidth: 250 }}
                >
                    <DataShow
                        key={name}
                        name={name}
                        showtable={false}
                        lang={lang}
                    />
                </Grid>
            )}
        </Grid>
    </>
)
