import csv
import json
import os

from xlsxwriter import Workbook

import utils
from dashreq import get_dash_data, get_dash_req
from utils import group_sheet_data
from xlscolumn import worksheet_autowidth
import createhtml

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

            if not isinstance(data, list):
                data = [data]
            data = list(data)
            fields = list(data[0].keys())
            print(sheetname, fields)

            worksheet = workbook.add_worksheet(sheetname)
            worksheet.write_row(row=0, col=0, data=fields)
            for index, item in enumerate(data):
                row = map(lambda field_id: item.get(field_id, ''), fields)
                worksheet.write_row(row=index + 1, col=0, data=row)

            worksheet_autowidth(worksheet, len(fields))

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

    # links = [('out/covid.xlsx', 'XLS with sheets'), ('out/covid.csv', 'CSV containing all')]
    # links += [(f'out/csv/{sheetname}.csv', f'{sheetname}') for sheetname, data in sheet2data]
    # createhtml.create_index_html(links)