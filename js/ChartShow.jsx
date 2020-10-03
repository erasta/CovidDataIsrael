var image = new Image();
image.src = "images/eran.dev.water.png";

const ChartShow = ({ chartStyle, dates, fieldNames, mutedFields, fieldValues, dateBounds, enforceChart }) => {
    if (!dates.length || !fieldNames.length) return null;

    if (enforceChart) {
        if (enforceChart.style) chartStyle = enforceChart.style;
        if (enforceChart.bounds) dateBounds = enforceChart.bounds;
        if (enforceChart.fields) mutedFields = fieldNames.filter(f => !enforceChart.fields.includes(f));
    }

    const data = {
        labels: dates,
        datasets: fieldValues.map((field, i) => {
            const color = colorByNumber(i, fieldNames.length + 1);
            return {
                type: chartStyle,
                label: fieldNames[i],
                backgroundColor: attachAlpha(color, 0.2),
                borderColor: attachAlpha(color, 1),
                borderWidth: 1,
                pointRadius: 1,
                data: field,
                hidden: mutedFields.includes(fieldNames[i])
            }
        })
    };

    return (
        <ReactChartjs2.default
            legend={false}
            data={data}
            type={chartStyle}
            options={{
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: 0,
                                min: 0,
                            }
                        }
                    ],
                    xAxes: [
                        {
                            ticks: {
                                min: (dateBounds ? dateBounds[0] : undefined),
                                max: (dateBounds ? dateBounds[1] : undefined)
                            },
                            type: 'time',
                            time: {
                                displayFormats: {
                                    day: 'D/M',
                                    month: 'M/Y',
                                }
                            }
                        }
                    ]
                },
                watermark: {
                    image: image, opacity: 0.08, alignToChartArea: true, width: 50, height: 20
                }
            }}
        />
    )
}

