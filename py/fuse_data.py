import csv
from mmap import PROT_READ
from os import system
# import pandas as pd
import numpy as np
import urllib.request
import more_itertools


def readCsvUrl(url, fields):
    print(url)
    text = urllib.request.urlopen(url).read().decode('utf-8')
    reader = csv.DictReader(text.split('\n'), delimiter=',')
    rows = [row for row in reader if any(k in fields for k in fields)]
    outrows = []
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for row in rows:
        newrow = {}
        newdate = row['date']
        if len(newdate) > 15:
            newdate = newdate[0:10]
        elif newdate[2] == '-' and newdate[6] == '-':
            parts = newdate.split('-')
            mon = str(months.index(parts[1]) + 1).zfill(2)
            newdate = parts[2] + '-' + mon + '-' + parts[0]
        newrow['date'] = newdate
        for key in fields:
            if key in row.keys():
                newrow[key] = row[key]
        outrows += [newrow]
    return outrows

def readAllHardPatients():
    # lastUpdate = sheets['lastUpdate']['lastUpdate'][:10]
    # critical = [{'date': lastUpdate, 'critical': sheets['hardPatient']['countCriticalStatus']}]
    # ventilated = [{'date': lastUpdate, 'ventilated': sheets['hardPatient']['countBreath']}]
    # ecmo = [{'date': lastUpdate, 'ecmo': sheets['hardPatient']['countEcmo']}]
    system("for F in $(find out/history -name 'hardPatient.csv' | sort); do echo $F | awk '{a=substr($0,13,10);print a;}' | tr '\n\r' ','; cat $F | tr '\n\r' ','; echo; done > out/csv/hardlist.csv")
    hardlist = [line.strip().split(',') for line in open('out/csv/hardlist.csv')]
    harddict = [{**{"date": x[0]}, **dict(zip(x[1:x.index('')], x[x.index('')+1:-2]))} for x in hardlist]
    return harddict

def readExternalTables():
    new_hospitalized = readCsvUrl(
        "https://raw.githubusercontent.com/yuval-harpaz/covid-19-israel-matlab/master/data/Israel/dashboard_timeseries.csv",
        ['new_hospitalized'])

    patientsPerDate09 = readCsvUrl(
        "https://raw.githubusercontent.com/erasta/CovidDataIsrael/master/out/history/2022-01-09/patientsPerDate.csv",
        ['countEasyStatus',
         'countMediumStatus',
         'countHardStatus',
         'countBreath',
         'countCriticalStatus',
         'countEcmo',
         'CountSeriousCriticalCum',
         'new_hospitalized'])

    patientsPerDate24 = readCsvUrl(
        "https://raw.githubusercontent.com/erasta/CovidDataIsrael/master/out/history/2022-01-24/patientsPerDate.csv",
        ['CountBreathCum'])

    return new_hospitalized, patientsPerDate09, patientsPerDate24

def fuse_data(sheet2data):
    sheets = dict(sheet2data)

    deadPatientsPerDate = []
    for row in sheets['deadPatientsPerDate']:
        deadPatientsPerDate += [{'date': row['date'][0:10],
                                 'deaths': row['amount']}]

    infectedPerDate = []
    for row in sheets['infectedPerDate']:
        infectedPerDate += [{'date': row['date'][0:10],
                             'cases': row['amount'],
                             'recovered': row['recovered']}]

    testResultsPerDate = []
    for row in sheets['testResultsPerDate']:
        testResultsPerDate += [{'date': row['date'][0:10],
                                'tests': row['amountPersonTested'],
                                'positiveRate': row['positiveRate'],
                                'positiveRate': row['positiveRate'],
                                'positiveRatePCR': row['positiveRatePCR'],
                                'positiveRateAntigen': row['positiveRateAntigen']}]
    patientsPerDate = []
    for row in sheets['patientsPerDate']:
        patientsPerDate += [{'date': row['date'][0:10],
                             'severe_new': row['serious_critical_new'],
                             'medium_new': row['medium_new'],
                             'easy_new': row['easy_new']}]

    hospitalizationStatusDaily = []
    for row in sheets['hospitalizationStatusDaily']:
        hospitalizationStatusDaily += [{'date': row['dayDate'][0:10],
                                        'countHardStatus': row['countHardStatus'],
                                        'countMediumStatus': row['countMediumStatus'],
                                        'countEasyStatus': row['countEasyStatus']}]

    harddict = readAllHardPatients()
    new_hospitalized, patientsPerDate09, patientsPerDate24 = readExternalTables()

    tables = [
        harddict,
        infectedPerDate,
        testResultsPerDate,
        deadPatientsPerDate,
        patientsPerDate,
        patientsPerDate09,
        patientsPerDate24,
        hospitalizationStatusDaily,
        new_hospitalized,
    ]

    # for table in tables:
    #     keys = set(more_itertools.flatten([row.keys() for row in table]))
    #     keys.discard('date')
    #     for row in table:
    #         pass

    bydate = []
    for table in tables:
        for row in table:
            found = False
            for rowout in bydate:
                if row['date'] == rowout['date']:
                    found = True
                    for key in row.keys():
                        if row[key] != "":
                            rowout[key] = row[key]
                    break
            if not found:
                bydate += [row]

    ret = sorted(bydate, key=lambda x: x['date'])

    #         currdate = str(row['date'])
    #         if currdate not in bydate:
    #             bydate[currdate] = {}

    # ret = [x for x in bydate.values()]
    # ret = mergeWithOtherTables(ret, deadPatientsPerDate, infectedPerDate)
    # find(ret, now)['ecmo'] = ecmo
    # combined = pd.concat([
    #     pd.DataFrame(harddict),
    #     pd.DataFrame(infectedPerDate),
    #     pd.DataFrame(testResultsPerDate),
    #     pd.DataFrame(hospitalizationStatusDaily),
    #     pd.DataFrame(deadPatientsPerDate),
    #     pd.DataFrame(patientsPerDate),
    #     ]).groupby(["date"])
    # # ombined.agg(sum).reset_index().to_csv('timeseries.csv')
    # ret = combined.agg(sum).reset_index().to_dict('records')
    return ret


if __name__ == '__main__':
    new_hospitalized, patientsPerDate09, patientsPerDate24 = readExternalTables()
    print()
