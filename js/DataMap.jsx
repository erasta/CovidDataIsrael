const { Map: LeafletMap, TileLayer, Marker, Popup, Circle, CircleMarker, LayersControl, LayerGroup } = window.ReactLeaflet;

const ramzor = (positivesThisWeek, sickThisWeek, sickLastWeek, sick2WeekAgo) => {
    if (positivesThisWeek === undefined || sickThisWeek === undefined || sickLastWeek === undefined || sick2WeekAgo === undefined) {
        return undefined;
    }
    const k = 2;
    const m = 8;
    const N = sickThisWeek - sickLastWeek;
    const N1 = sickLastWeek - sick2WeekAgo;
    if (N1 === 0) {
        return undefined;
    }
    const G = N / N1 - 1;
    const NGG = N * G * G;
    if (NGG < 0.0000000001) return 0;
    const ramzor_raw = k + Math.log(NGG) + positivesThisWeek / m;
    return Math.min(10, Math.max(0, ramzor_raw));
}

const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dt = date.getDate();
    return year + '-' + (month >= 10 ? month : '0' + month) + '-' + (dt >= 10 ? dt : '0' + dt);
}

const dateMinusDays = (date, daysToGoBack) => {
    let ret = new Date(date || new Date().setHours(0, 0, 0, 0));
    ret.setDate(-daysToGoBack);
    return toIsoDate(ret);
}

const DataMap = ({ height = 800 }) => {
    const [cities, setCities] = React.useState([]);
    const [geoloc, setGeoloc] = React.useState([]);
    const [showHistory, setShowHistory] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            const geoloc1 = await fetchCsv('jsons/city_geoloc.csv');
            setGeoloc(geoloc1);
        })();
    }, [])
    React.useEffect(() => {
        (async () => {
            let parsed = await fetchTable('contagionDataPerCityPublic', tableFileName('contagionDataPerCityPublic', showHistory));
            let back1week = await fetchTable('contagionDataPerCityPublic', tableFileName('contagionDataPerCityPublic', dateMinusDays(showHistory, 7)));
            let back2week = await fetchTable('contagionDataPerCityPublic', tableFileName('contagionDataPerCityPublic', dateMinusDays(showHistory, 14)));
            parsed.forEach(city => {
                const loc = geoloc.find(c => c.SettlementCode === city['City Code']);
                city.latlng = !loc ? undefined : [loc.Y_GEO, loc.X_GEO];
                const city1week = back1week ? back1week.find(c => c['City Code'] === city['City Code']) : undefined;
                const city2week = back2week ? back2week.find(c => c['City Code'] === city['City Code']) : undefined;
                city['Actual Sick Per 10000, 1 week ago'] = city1week ? city1week['Actual Sick Per 10000'] : undefined;
                city['Actual Sick Per 10000, 2 week ago'] = city2week ? city2week['Actual Sick Per 10000'] : undefined;
            });
            parsed = parsed.filter(city => city.latlng && !isNaN(city.latlng[0]) && !isNaN(city.latlng[1]));
            setCities(parsed);
        })();
    }, [showHistory, geoloc])
    const fields = [
        { name: 'Verified/Tests ratio', color: 'red' },
        { name: 'Infected Per 10000', color: 'blue' },
        { name: 'Actual Sick Per 10000', color: 'green' },
        { name: 'Verified Last 7 Days Per 10000', color: 'brown' },
        { name: 'Test Last 7 Days Per 10000', color: 'purple' },
    ];

    return (
        <>
            <HistorySlider onHistory={v => setShowHistory(v)} withPlay={true} />
            <LeafletMap center={[32.0897, 34.8042]} zoom={12} style={{ height: height }}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LayersControl collapsed={true}>
                    <LayersControl.Overlay name="הדבקה לפי עיר" checked={true}>
                        <LayerGroup>
                            {
                                fields.map((field, i) => {
                                    const maxval = Math.max(...cities.map(city => city[field.name]));
                                    return cities.map(city => {
                                        // console.log(city.City, city['City Code'], city.latlng)
                                        if (!city[field.name]) {
                                            return null;
                                        }
                                        return (
                                            <SemiCircle
                                                position={city.latlng}
                                                key={city['City Code']}
                                                radius={city[field.name] * 2500 / maxval}
                                                weight={1}
                                                color={field.color}
                                                startAngle={i * 360 / fields.length}
                                                stopAngle={(i + 1) * 360 / fields.length}
                                                fillOpacity={0.4}
                                                onMouseOver={(e) => {
                                                    e.target.openPopup();
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.closePopup();
                                                }}
                                            >
                                                <Popup>
                                                    <p key='city' style={{ margin: 0, textAlign: 'right', fontWeight: 600 }}>
                                                        {city.City}
                                                    </p>
                                                    <table style={{ border: 'none' }}>
                                                        <tbody>
                                                            {fields.map(f => (
                                                                <tr key={f.name} style={{ border: 'none', margin: 0, color: f.color, whiteSpace: 'nowrap' }}>
                                                                    <td key={1} style={{ border: 'none' }}>
                                                                        {f.name + (f.name === 'Verified/Tests ratio' ? ' Last 7 Days' : '')}
                                                                    </td>
                                                                    <td key={2} style={{ border: 'none', textAlign: 'right' }}>
                                                                        {truncateDigits(city[f.name])}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </Popup>
                                            </SemiCircle>
                                        )
                                    })
                                })
                            }
                        </LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="רמזור - עדיין בבדיקות" checked={false}>
                        <LayerGroup>
                            {
                                cities.map(city => {
                                    const num = ramzor(
                                        city['Verified Last 7 Days Per 10000'],
                                        city['Actual Sick Per 10000'],
                                        city['Actual Sick Per 10000, 1 week ago'],
                                        city['Actual Sick Per 10000, 2 week ago']
                                    );
                                    if (num === undefined) {
                                        return null;
                                    }
                                    const color = d3.interpolateRdYlGn(1 - (num / 10));
                                    return (
                                        <CircleMarker
                                            key={city['City Code']}
                                            center={city.latlng}
                                            // weight={ 1}
                                            color={color}
                                        >
                                            <Popup>
                                                <p key='city' style={{ margin: 0, textAlign: 'right', fontWeight: 600 }}>
                                                    {city.City}
                                                </p>
                                                <p key='ramzor'>
                                                    רמזור {num}
                                                </p>
                                                <p key='ver'>
                                                    נדבקים ל10000 השבוע {city['Verified Last 7 Days Per 10000']}
                                                </p>
                                                <p key='act'>
                                                    חולים ל10000 השבוע {city['Actual Sick Per 10000']}
                                                </p>
                                                <p key='act7'>
                                                    חולים ל10000 לפני שבוע {city['Actual Sick Per 10000, 1 week ago']}
                                                </p>
                                                <p key='act14'>
                                                    חולים ל10000 לפני שבועיים {city['Actual Sick Per 10000, 2 week ago']}
                                                </p>
                                            </Popup>
                                        </CircleMarker>
                                    )
                                })
                            }
                        </LayerGroup>
                    </LayersControl.Overlay>
                </LayersControl>
            </LeafletMap>
        </>
    )
}