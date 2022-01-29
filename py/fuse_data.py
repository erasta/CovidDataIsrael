from os import system
import pandas as pd
import numpy as np
def fuse_data(sheet2data):
    sheets = dict(sheet2data)

    deadPatientsPerDate = []
    for row in sheets['deadPatientsPerDate']:
        deadPatientsPerDate += [{'date': row['date'][0:10], 'deaths': row['amount']}]

    infectedPerDate = []
    for row in sheets['infectedPerDate']:
        infectedPerDate += [{'date': row['date'][0:10], 'cases': row['amount'], 'recovered': row['recovered']}]

    testResultsPerDate = []
    for row in sheets['testResultsPerDate']:
        testResultsPerDate += [{'date': row['date'][0:10], 'tests': row['amountPersonTested'], 'positiveRate': row['positiveRate'],\
                             'positiveRate': row['positiveRate'], 'positiveRatePCR': row['positiveRatePCR'],'positiveRateAntigen': row['positiveRateAntigen']}]
    patientsPerDate = []
    for row in sheets['patientsPerDate']:
        patientsPerDate += [{'date': row['date'][0:10], 'severe_new': row['serious_critical_new'], 'medium_new': row['medium_new'], 'mild_new': row['easy_new']}]

    hospitalizationStatusDaily = []
    for row in sheets['hospitalizationStatusDaily']:
        hospitalizationStatusDaily += [{'date': row['dayDate'][0:10], 'severe': row['countHardStatus'], 'medium': row['countMediumStatus'], 'mild': row['countEasyStatus']}]
    # lastUpdate = sheets['lastUpdate']['lastUpdate'][:10]
    # critical = [{'date': lastUpdate, 'critical': sheets['hardPatient']['countCriticalStatus']}]
    # ventilated = [{'date': lastUpdate, 'ventilated': sheets['hardPatient']['countBreath']}]
    # ecmo = [{'date': lastUpdate, 'ecmo': sheets['hardPatient']['countEcmo']}]

    system("for F in $(find out/history -name 'hardPatient.csv' | sort); do echo ${F:12:10} | tr '\n\r' ','; cat $F | tr '\n\r' ','; echo; done > out/csv/hardlist.csv")
    hardlist = [line.strip().split(',') for line in open('out/csv/hardlist.csv')]
    harddict = [{**{"date": x[0]}, **dict(zip(x[1:x.index('')], x[x.index('')+1:-2]))} for x in hardlist]

    bydate = []
    for table in [harddict, infectedPerDate, testResultsPerDate, hospitalizationStatusDaily, deadPatientsPerDate, patientsPerDate]:
        for row in table:
            found = False
            for rowout in bydate:
                if row['date'] == rowout['date']:
                    found = True
                    for key in row.keys():
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
