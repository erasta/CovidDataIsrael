import csv
import json
import os

from xlsxwriter import Workbook

import utils
from dashreq import get_dash_data, get_dash_req
from utils import group_sheet_data
import xlscolumn

dashrequest = get_dash_req()
for r in dashrequest['requests']:
    print(r['id'], r['queryName'])
# print(json.dumps(dashrequest, indent=4, sort_keys=True))
# exit()
sheets = list(map(lambda x: x['queryName'], dashrequest['requests']))

dashjson = get_dash_data()
datas = list(map(lambda x: x['data'], dashjson))
# datas = list(range(len(sheets)))

sheet2data = group_sheet_data(sheets, datas)

deadPatientsPerDate = [data for sheetname, data in sheet2data if sheetname == 'deadPatientsPerDate']
if len(deadPatientsPerDate) > 0:
    sheet2data.append(('deadWeekly_computed', utils.computeWeekly(deadPatientsPerDate[0])))
    sheet2data.append(('deadDelta_computed', utils.computeDelta(deadPatientsPerDate[0], 'out/csv/deadPatientsPerDate.csv')))

os.makedirs('out', exist_ok=True)
os.makedirs('out/csv', exist_ok=True)
with open('out/covid.csv', 'w') as csvall:
    with Workbook('out/covid.xlsx') as workbook:
        for sheetname, data in sheet2data:
            data, fields = utils.data2fields(data)
            print(sheetname, fields)

            xlscolumn.write_data_worksheet(data, fields, workbook, sheetname)

            with open('out/csv/' + sheetname + '.csv', 'w') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fields)
                writer.writeheader()
                for row in data:
                    writer.writerow(row)

            titleline = '-' * len(sheetname)
            print(f'{titleline}\n{sheetname}\n{titleline}', file=csvall)
            writerall = csv.DictWriter(csvall, fieldnames=fields)
            writerall.writeheader()
            for row in data:
                writerall.writerow(row)
            print('\n', file=csvall)
