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
    lastUpdate = sheets['lastUpdate']['lastUpdate'][:10]
    critical = [{'date': lastUpdate, 'critical': sheets['hardPatient']['countCriticalStatus']}]
    ventilated = [{'date': lastUpdate, 'ventilated': sheets['hardPatient']['countBreath']}]
    ecmo = [{'date': lastUpdate, 'ecmo': sheets['hardPatient']['countEcmo']}]
    
    # ret = []
    # ret = mergeWithOtherTables(ret, deadPatientsPerDate, infectedPerDate)
    # find(ret, now)['ecmo'] = ecmo
    combined = pd.concat([
        pd.DataFrame(infectedPerDate),
        pd.DataFrame(testResultsPerDate),
        pd.DataFrame(hospitalizationStatusDaily),
        pd.DataFrame(deadPatientsPerDate),
        pd.DataFrame(patientsPerDate),
        pd.DataFrame(critical),
        pd.DataFrame(ventilated),
        pd.DataFrame(ecmo)
        ]).groupby(["date"])
    # ombined.agg(sum).reset_index().to_csv('timeseries.csv')
    ret = combined.agg(sum).reset_index().to_dict('records')
    return ret
