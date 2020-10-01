const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

const {
    BrowserRouter, Switch, Route, Link, useLocation
} = ReactRouterDOM;

// let sheetname = new URL(window.location.href).searchParams.get("sheet");
// sheetname = sheetname || 'showcharts';
// console.log(sheetname);

const ShowByName = ({ name, names, lang }) => {
    if (name === 'showcharts') return <DataShowCharts names={names} lang={lang} />
    if (name === 'infectedVsDead') return <DataShowComputedDeath showtable={true} lang={lang} />
    return <DataShow name={name} lang={lang} />
}

let languages;
let names = [];

const trans = (lang, text) => {
    if (!text || text === "") return text;
    if (!lang) return '';
    if (lang[text]) return lang[text];
    const nospaces = text.replace(/[ _]/g, '');
    if (lang[nospaces]) return lang[nospaces];
    return text;
}

const App = () => {
    const [lastUpdate, setLastUpdate] = React.useState('...');
    const [language, setLanguage] = React.useState('he');

    const location = useLocation();
    React.useEffect(() => {
        console.log(location.pathname + location.search)
        window.ga('set', 'page', location.pathname + location.search);
        window.ga('send', 'pageview');
    }, [location]);

    const name = new URLSearchParams(location.search).get("sheet");

    (async () => {
        const last = await fetchCsv(`out/csv/lastUpdate.csv`);
        if (last && last.length && last[0].lastUpdate) {
            setLastUpdate(last[0].lastUpdate.toLocaleString('en-GB', { hour12: false }));
        }
    })();

    const lang = languages[language];

    return <>
        <Grid container direction="row">
            <Grid item xs={3}>
                <Grid container direction="row" justify="flex-start" alignItems="center">
                    <IconButton onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}>
                        <img width={32} height={32} src={`images/${language === 'he' ? 'il' : 'gb'}.svg`}></img>
                    </IconButton>
                    <p style={{
                        fontFamily: 'Source Sans Pro, sans-serif',
                        textAlign: 'left',
                    }}>
                        {trans(lang, 'lastUpdate')}<br />
                        {lastUpdate}
                    </p>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <h1 style={{
                    // fontFamily: 'Source Sans Pro, sans-serif',
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
        <Grid container direction="row">
            <Grid item xs={3}>
                <CsvButtons names={names} lang={lang} />
            </Grid>
            <Grid item xs={9}>
                <ShowByName name={name} names={names} lang={lang} />
            </Grid>
        </Grid>
        <p style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
        }}>
            Updated hourly from the&nbsp;
            <MaterialUI.Link href='https://www.health.gov.il/English/Pages/HomePage.aspx' style={{ textDecoration: 'none' }} target="_blank" rel="noopener">
                public API of Ministry of Health of Israel
            </MaterialUI.Link>
            <br />
            Created by&nbsp;
             <MaterialUI.Link href="https://eran.dev/" style={{ textDecoration: 'none' }} target="_blank" >
                © Eran Geva
            </MaterialUI.Link>
            &nbsp;as&nbsp;
            <MaterialUI.Link href='https://github.com/erasta/CovidDataIsrael' style={{ textDecoration: 'none' }} target="_blank" rel="noopener">
                open-source code
            </MaterialUI.Link>
        </p>
    </>
}

(async () => {
    let [langs1, names1, names2, names3] = await Promise.all([
        await (await fetch('jsons/lang.json')).json(),
        await (await fetch('jsons/dashreq.json')).json(),
        await (await fetch('jsons/dashcomputed.json')).json(),
        await (await fetch('jsons/mohfiles.json')).json()
    ]);

    languages = langs1;
    names = names1.requests.map(j => j.queryName).concat(names2).concat(names3.map(r => r.name));

    ReactDOM.render(
        (<BrowserRouter>
            <App name={'showcharts'} />
        </BrowserRouter>),
        // <App name={'showcharts'} />
        document.getElementById('root'))
})()