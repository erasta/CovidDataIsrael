const { Map: LeafletMap, TileLayer, Marker, Popup, Circle, CircleMarker } = window.ReactLeaflet;

const DataMap = ({ height = 800 }) => {
    const [cities, setCities] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            let parsed = await fetchTable('contagionDataPerCityPublic', tableFileName('contagionDataPerCityPublic'));
            const geoloc = await fetchCsv('jsons/city_geoloc.csv');
            parsed.forEach(city => {
                const loc = geoloc.find(c => c.SettlementCode === city['City Code']);
                city.latlng = !loc ? undefined : [loc.Y_GEO, loc.X_GEO];
            });
            parsed = parsed.filter(city => city.latlng);
            setCities(parsed);
        })();
    }, [])
    const fields = [
        { name: 'Verified/Tests ratio', color: 'red' },
        { name: 'Infected Per 10000', color: 'blue' },
        { name: 'Actual Sick Per 10000', color: 'green' },
        { name: 'Verified Last 7 Days Per 10000', color: 'brown' },
        { name: 'Test Last 7 Days Per 10000', color: 'purple' },
    ];

    return (
        <LeafletMap center={[32.0897, 34.8042]} zoom={12} style={{ height: height }}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                fields.map((field, i) => {
                    const maxval = Math.max(...cities.map(city => city[field.name]));
                    return cities.map(city => (
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
                                                <td key={1} style={{ border: 'none' }}>{f.name}</td>
                                                <td key={2} style={{ border: 'none', textAlign: 'right' }}>{truncateDigits(city[f.name])}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Popup>
                        </SemiCircle>
                    ))
                })
            }
        </LeafletMap>
    )
}