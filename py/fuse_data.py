import pandas as pd
import csv
from mmap import PROT_READ
from os import system
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
            for rkey in row.keys():
                if key.lower().replace('_', '') == rkey.lower().replace('_', ''):
                    newrow[key] = row[rkey]
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

    hardPatients = readAllHardPatients()
    new_hospitalized, patientsPerDate09, patientsPerDate24 = readExternalTables()

    tables = [
        ('hardPatients', hardPatients),
        ('infectedPerDate', infectedPerDate),
        ('testResultsPerDate', testResultsPerDate),
        ('deadPatientsPerDate', deadPatientsPerDate),
        ('patientsPerDate', patientsPerDate),
        ('patientsPerDate09', patientsPerDate09),
        ('patientsPerDate24', patientsPerDate24),
        ('hospitalizationStatusDaily', hospitalizationStatusDaily),
        ('new_hospitalized', new_hospitalized),
    ]

    for (name, table) in tables:
        keys = set(more_itertools.flatten([row.keys() for row in table]))
        keys.discard('date')
        print(name, ':')
        print(keys)

    bydate = []
    for (name, table) in tables:
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

    return ret


if __name__ == '__main__':
    new_hospitalized, patientsPerDate09, patientsPerDate24 = readExternalTables()
    print()
