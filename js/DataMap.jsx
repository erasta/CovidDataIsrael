const { Map: LeafletMap, TileLayer, Marker, Popup, Circle, CircleMarker, LayersControl, LayerGroup, Polygon, Tooltip } = window.ReactLeaflet;

// const ramzor = (positivesThisWeek, sickThisWeek, sickLastWeek, sick2WeekAgo) => {
//     if (positivesThisWeek === undefined || sickThisWeek === undefined || sickLastWeek === undefined || sick2WeekAgo === undefined) {
//         return undefined;
//     }
//     const k = 2;
//     const m = 8;
//     const N = sickThisWeek - sickLastWeek;
//     const N1 = sickLastWeek - sick2WeekAgo;
//     if (N1 === 0) {
//         return undefined;
//     }
//     const G = N / N1;
//     const NGG = N * G * G;
//     if (NGG < 0.0000000001) return 0;
//     const ramzor_raw = k + Math.log(NGG) + positivesThisWeek / m;
//     return Math.round(Math.min(10, Math.max(0, ramzor_raw)) * 100) / 100;
// }

const inverseCoords = (geometry) => {
    return geometry.geometry.coordinates.map(poly => {
        return poly.map(points => {
            return points.map(point => {
                return [point[1], point[0]];
            });
        });
    });
}

const DataMap = ({ height = 800 }) => {
    const [cities, setCities] = React.useState([]);
    const [geoloc, setGeoloc] = React.useState([]);
    const [geopoly, setGeopoly] = React.useState({});
    const [showHistory, setShowHistory] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            const geoloc1 = await fetchCsv('jsons/city_geoloc.csv');
            setGeoloc(geoloc1);
            const geopoly1 = await fetchJson('jsons/tufts-israelpalestinemuni08-geojson.json');
            // console.log(geopoly1)
            setGeopoly(geopoly1 ? geopoly1 : {});
        })();
    }, [])
    React.useEffect(() => {
        (async () => {
            let parsed = (await new FetchedTable('contagionDataPerCityPublic', showHistory).doFetch()).data;
            parsed.forEach(city => {
                const loc = geoloc.find(c => c.SettlementCode === city['City Code']);
                city.latlng = !loc ? undefined : [loc.Y_GEO, loc.X_GEO];
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
                    attribution='&amp;copy <a href="http://eran.dev">Eran Geva</a> | &amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LayersControl collapsed={false}>
                    <LayersControl.BaseLayer name="רמזור משוער לפי מאומתים" checked={true}>
                        <PolygonsByCity
                            cities={cities}
                            geopoly={geopoly}
                            detailsForCities={
                                cities.map(city => {
                                    const num = city['Ramzor by Verified'];
                                    return {
                                        code: city['City Code'],
                                        num: num === undefined ? num : num / 10,
                                        details: [
                                            ['רמזור', num],
                                            ['נדבקים ל10000 השבוע', city['Verified Last 7 Days Per 10000']],
                                            ['נדבקים ל10000 לפני שבוע', city['Verified Last 7 Days Per 10000, 1 week ago']],
                                            ['בדיקות ל10000 השבוע', city['Test Last 7 Days Per 10000']],
                                        ]
                                    }
                                })
                            }
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="רמזור משוער לפי חולים" checked={false}>
                        <PolygonsByCity
                            cities={cities}
                            geopoly={geopoly}
                            detailsForCities={
                                cities.map(city => {
                                    const num = city['Ramzor by Actual Sick'];
                                    return {
                                        code: city['City Code'],
                                        num: num === undefined ? num : num / 10,
                                        details: [
                                            ['רמזור', num],
                                            ['נדבקים ל10000 השבוע', city['Verified Last 7 Days Per 10000']],
                                            ['חולים ל10000 השבוע', city['Actual Sick Per 10000']],
                                            ['חולים ל10000 לפני שבוע', city['Actual Sick Per 10000, 1 week ago']],
                                            ['חולים ל10000 לפני שבועיים', city['Actual Sick Per 10000, 2 week ago']],
                                        ]
                                    }
                                })
                            }
                        />
                    </LayersControl.BaseLayer>
                    {fields.map(field => {
                        const fieldname = field.name;
                        const maxval = Math.max(...cities.map(city => city[fieldname]));
                        return (
                            <LayersControl.BaseLayer name={fieldname} checked={false} key={fieldname}>
                                <PolygonsByCity
                                    cities={cities}
                                    geopoly={geopoly}
                                    detailsForCities={
                                        cities.map(city => {
                                            let val = city[fieldname] / maxval;
                                            if (fieldname === 'Test Last 7 Days Per 10000') val = 1 - val;
                                            return {
                                                code: city['City Code'],
                                                num: val,
                                                details: [
                                                    [fieldname, truncateDigits(city[fieldname])]
                                                ]
                                            }
                                        })
                                    }
                                />
                            </LayersControl.BaseLayer>
                        )
                    })}
                    <LayersControl.BaseLayer name="נתוני הדבקה כגרף עוגה" checked={false}>
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
                    </LayersControl.BaseLayer>
                </LayersControl>
            </LeafletMap>
        </>
    )
}

const PolygonsByCity = ({ cities, geopoly, detailsForCities }) => {
    const hslLow = rgb2hsl([0, 104, 55]);
    const hslHigh = rgb2hsl([255, 0, 0]);

    return (
        <LayerGroup>
            {
                cities.map(city => {
                    const cityCode = city['City Code'];
                    const detailsForCity = detailsForCities.find(d => d.code === cityCode);
                    if (detailsForCity === undefined) {
                        return null;
                    }
                    const num = detailsForCity.num;
                    if (num === undefined) {
                        return null;
                    }
                    const color = 'rgb(' + hsl2rgb(_interpolateColor(hslLow, hslHigh, num)).join(',') + ')';
                    // const color1 = d3.interpolateRdYlGn(1 - (num));
                    const details = detailsForCity.details;
                    const popup = (
                        <Popup>
                            <p key='city' style={{ margin: 0, textAlign: 'right', fontWeight: 600 }}>
                                {city.City}
                            </p>
                            {
                                details.map(detail => {
                                    const [name, number] = detail;
                                    return (
                                        <p key={name} style={{ margin: 0, textAlign: 'right' }}>
                                            {name}: {number}
                                        </p>
                                    )
                                })
                            }
                        </Popup>
                    );
                    if (geopoly.type) {
                        const poly = geopoly.features.find(f => f.properties.MUNICIPAL_ === cityCode);
                        if (poly) {
                            return (
                                <Polygon
                                    positions={inverseCoords(poly)}
                                    key={cityCode}
                                    color={color}
                                    weight={2}
                                >
                                    {popup}
                                </Polygon>
                            )
                        }
                    }
                    return (
                        <Circle
                            key={cityCode}
                            center={city.latlng}
                            weight={2}
                            radius={500}
                            color={color}
                            fillOpacity={0.4}
                        >
                            {popup}
                        </Circle>
                    )
                })
            }
        </LayerGroup>
    )
}