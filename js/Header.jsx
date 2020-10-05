const Header = ({lang}) => {
    return (
        <Grid container direction="row">
            <Grid item xs={3}>
                <MaterialUI.Link href="https://eran.dev/" style={{ textDecoration: 'none' }} target="_blank" >
                    <p style={{
                        fontFamily: 'Source Sans Pro, sans-serif',
                        textAlign: 'left',
                        marginRight: 10
                    }}>
                        eran.dev
                        {/* {trans(lang, 'Contact')} */}
                    </p>
                </MaterialUI.Link>
            </Grid>
            <Grid item xs={6}>
                <h1 style={{
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    textAlign: 'center',
                    fontSize: 'xx-large'
                }}>
                    {trans(lang, 'Covid-19 Data Israel')}
                </h1>
            </Grid>
            <Grid item xs={3}>
                <Grid container direction="row" justify="flex-end" alignItems="center">
                    <LastUpdate lang={lang} />
                </Grid>
            </Grid>
        </Grid>
    )
}