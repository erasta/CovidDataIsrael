const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const CsvButtons = ({ names, lang }) => (
    <Grid container direction='column'>
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

