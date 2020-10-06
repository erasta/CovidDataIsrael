var image = new Image();
image.src = "images/eran.dev.water.png";

const ChartShow = ({ chartStyle, dates, fieldNames, mutedFields, fieldValues, dateBounds, enforceChart }) => {
    if (!dates.length || !fieldNames.length) return null;

    if (enforceChart) {
        if (enforceChart.style) chartStyle = enforceChart.style;
        if (enforceChart.bounds) dateBounds = enforceChart.bounds;
        if (enforceChart.fields) mutedFields = fieldNames.filter(f => !enforceChart.fields.includes(f));
    }

    const realChartStyle = chartStyle === 'curve' ? 'line' : chartStyle;
    const data = {
        labels: dates,
        datasets: fieldValues.map((field, i) => {
            const fieldName = fieldNames[i];
            let color = colorByNumber(i, fieldNames.length + 1);
            if (enforceChart && enforceChart.colors && enforceChart.fields) {
                const pos = enforceChart.fields.findIndex(f => fieldName === f);
                if (pos !== -1) {
                    color = enforceChart.colors[pos];
                }
            }
            let backColor = attachAlpha(color, 0.2);
            if (chartStyle === 'bar') {
                backColor = field.map((_, i) => i === field.length - 1 ? 'rgba(0, 0, 0, 0.3)' : backColor);
            }
            return {
                type: realChartStyle,
                label: fieldName,
                backgroundColor: backColor,
                borderColor: color, //attachAlpha(color, 1),
                borderWidth: 1,
                pointRadius: 1,
                data: field,
                hidden: mutedFields.includes(fieldNames[i]),
                fill: chartStyle !== 'curve',
                lineTension: 0.1,
            }
        })
    };

    const tmin = dateBounds ? dateBounds[0] : undefined;
    const tmax = dateBounds ? dateBounds[1] : undefined;
    const ymax = Math.max(...fieldValues
        .filter((_, i) => !mutedFields.includes(fieldNames[i]))
        .map(field => {
            const vals = field.filter((item, j) => {
                const d = dates[j];
                if (tmin && d < tmin) return false;
                if (tmax && d > tmax) return false;
                return true;
            })
            return Math.max(...vals);
        }));

    return (
        <ReactChartjs2.default
            legend={false}
            data={data}
            type={realChartStyle}
            plugins={enforceChart && enforceChart.numberOnTop ? [ChartDataLabels] : []}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: 0,
                                min: 0,
                                max: ymax
                            },
                            // stacked: true
                        }
                    ],
                    xAxes: [
                        {
                            ticks: {
                                min: tmin,
                                max: tmax
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

