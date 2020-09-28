const DataShowCharts = ({ names }) => (
    <>
        <DataShow
            key={'patientsPerDate'}
            name={'patientsPerDate'}
            showtable={false}
        />
        <Grid container key={'chartGrid'}>
            {[
                'infectedPerDate',
                'deadPatientsPerDate',
                'recoveredPerDay',
                'testResultsPerDate',
                'doublingRate',
                'calculatedVerified'
            ].map(name =>
                <Grid item xs={6} key={name}>
                    <DataShow
                        key={name}
                        name={name}
                        showtable={false}
                    />
                </Grid>
            )}
        </Grid>
    </>
)
