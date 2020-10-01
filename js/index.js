const {
    BrowserRouter, Switch, Route, Link, useLocation
} = ReactRouterDOM;

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