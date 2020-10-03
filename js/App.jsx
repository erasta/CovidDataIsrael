const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const {
    BrowserRouter, Switch, Route, Link, useLocation
} = ReactRouterDOM;

const trans = (lang, text) => {
    if (!text || text === "") return text;
    if (!lang) return '';
    if (lang[text]) return lang[text];
    const nospaces = text.replace(/[ _]/g, '');
    if (lang[nospaces]) return lang[nospaces];
    return text;
}

const App = ({ names, languages }) => {
    const [language, setLanguage] = React.useState('he');

    const location = useLocation();
    React.useEffect(() => {
        console.log(location.pathname + location.search)
        window.ga.getAll()[0].set('page', location.pathname + location.search);
        window.ga.getAll()[0].send('pageview')
    }, [location]);

    let name = new URLSearchParams(location.search).get("sheet");
    if (!name || !name.length) name = 'showcharts';

    const lang = languages[language];

    return (
        <>
            <Grid container direction="row">
                <Grid item xs={3}>
                    <Grid container direction="row" justify="flex-start" alignItems="center">
                        <IconButton onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}>
                            <img width={32} height={32} src={`images/${language === 'he' ? 'il' : 'gb'}.svg`}></img>
                        </IconButton>
                        <LastUpdate lang={lang} />
                    </Grid>
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
                    <MaterialUI.Link href="https://eran.dev/" style={{ textDecoration: 'none' }} target="_blank" >
                        <p style={{
                            fontFamily: 'Source Sans Pro, sans-serif',
                            textAlign: 'right',
                            marginRight: 10
                        }}>
                            {trans(lang, 'Contact')}
                        </p>
                    </MaterialUI.Link>
                </Grid>
            </Grid>
            <MainView name={name} names={names} lang={lang} />
            <Footer />
        </>
    );
}
