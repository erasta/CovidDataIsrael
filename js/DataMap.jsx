const { Map: LeafletMap, TileLayer, Marker, Popup, Circle, CircleMarker, LayersControl, LayerGroup, Polygon, Tooltip } = window.ReactLeaflet;

const inverseCoords = (geometry) => {
    return geometry.geometry.coordinates.map(poly => {
        return poly.map(points => {
            return points.map(point => {
                return [point[1], point[0]];
            });
        });
    });
}

const polyToLatlng = (poly) => {
    let lat = 0, lng = 0;
    const flat = poly.flat().flat();
    if (flat.length) {
        flat.forEach(coord => {
            lat += coord[0];
            lng += coord[1];
        });
        return [lat / flat.length, lng / flat.length];
    }
    return undefined;
}

const DataMap = ({ height = 800 }) => {
    const [citiesUnfiltered, setCitiesUnfiltered] = React.useState([]);
    const [cityloc, setCityloc] = React.useState({});
    const [showHistory, setShowHistory] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const cityloc1 = {};
            const geoloc1 = await fetchCsv('jsons/city_geoloc.csv');
            geoloc1.forEach(city => {
                const code = city.SettlementCode;
                cityloc1[code] = cityloc1[code] || {};
                cityloc1[code].latlng = [city.Y_GEO, city.X_GEO];
            })
            const geopoly1 = await fetchJson('jsons/tufts-israelpalestinemuni08-geojson.json');
            geopoly1.features.forEach(city => {
                const code = city.properties.MUNICIPAL_;
                cityloc1[code] = cityloc1[code] || {};
                cityloc1[code].poly = (cityloc1[code].poly || []).concat(inverseCoords(city));
                if (!cityloc1[code].latlng) {
                    cityloc1[code].latlng = polyToLatlng(cityloc1[code].poly)
                }
            })
            setCityloc(cityloc1);
        })();
    }, []);

    React.useEffect(() => {
        (async () => {
            let parsed = (await new FetchedTable('contagionDataPerCityPublic', showHistory).doFetch()).data;
            setCitiesUnfiltered(parsed);
        })();
    }, [showHistory])
    const fields = [
        { name: 'Verified/Tests ratio', color: 'red' },
        { name: 'Infected Per 10000', color: 'blue' },
        { name: 'Actual Sick Per 10000', color: 'green' },
        { name: 'Verified Last 7 Days Per 10000', color: 'brown' },
        { name: 'Test Last 7 Days Per 10000', color: 'purple' },
    ];

    const cities = citiesUnfiltered.map(city => {
        return Object.assign({}, city, cityloc[city['City Code']]);
    }).filter(city => (city.latlng || city.poly) && city['City Code']);

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
                                        if (!city[field.name] || !city.latlng) {
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

const PolygonsByCity = ({ cities, detailsForCities }) => {
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
                    if (city.poly) {
                        return (
                            <Polygon
                                positions={city.poly}
                                key={cityCode}
                                color={color}
                                weight={2}
                            >
                                {popup}
                            </Polygon>
                        )
                    } else {
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
                    }
                })
            }
        </LayerGroup>
    )
}