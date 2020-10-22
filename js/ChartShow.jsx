var image = new Image();
image.src = "images/eran.dev.water.png";

const ChartShow = ({ chartStyle, dates, fieldNames, mutedFields, fieldValues, dateBounds, logarithmic, enforceChart, xAxesMinUnit }) => {
    if (!dates.length || !fieldNames.length) return null;

    if (enforceChart) {
        if (enforceChart.style) chartStyle = enforceChart.style;
        if (enforceChart.bounds) dateBounds = enforceChart.bounds;
        if (enforceChart.fields) mutedFields = fieldNames.filter(f => !enforceChart.fields.includes(f));
    }

    const fixedDates = dates.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()));

    const realChartStyle = chartStyle === 'curve' ? 'line' : chartStyle;
    const isLastToday = dates[dates.length - 1].toDateString() === new Date().toDateString();
    const data = {
        labels: fixedDates,
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
            if (chartStyle === 'bar' && isLastToday) {
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

    const hourMidDay = (d, prev = false) => {
        if (d && d.setHours) {
            d = new Date(d)
            d.setHours(prev ? -12 : 12, 0, 0, 0);
        }
        return d;
    }
    const tmin = hourMidDay(dateBounds ? dateBounds[0] : undefined, true);
    const tmax = hourMidDay(dateBounds ? dateBounds[1] : undefined);
    let ymax = undefined;
    if (tmin || tmax) {
        ymax = Math.max(...fieldValues
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
    }

    const options = {
        plugins: {
            datalabels: {
                color: '#000000',
                // font: { weight: 'bold' }
            }
        },
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: 0,
                        min: 0,
                        max: ymax,
                        callback: ((v) => v)
                    },
                    type: logarithmic ? 'logarithmic' : 'linear'
                    // stacked: true
                }
            ],
            xAxes: [
                {
                    ticks: {
                        min: tmin,
                        max: tmax,
                    },
                    type: 'time',
                    time: {
                        displayFormats: {
                            day: 'D/M',
                            week: 'D/M',
                            month: 'M/Y',
                        },
                        minUnit: xAxesMinUnit ? xAxesMinUnit : 'day'
                    }
                }
            ]
        },
        watermark: {
            image: image, opacity: 0.08, alignToChartArea: true, width: 50, height: 20
        }
    };
    return (
        <ReactChartjs2.default
            legend={false}
            data={data}
            type={realChartStyle}
            plugins={enforceChart && enforceChart.numberOnTop ? [ChartDataLabels] : []}
            options={options}
        />
    )
}

