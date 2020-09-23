import csv
import json
import os

from xlsxwriter import Workbook

import utils
from dashreq import get_dash_data, get_dash_req
from utils import group_sheet_data
from xlscolumn import worksheet_autowidth

dashrequest = get_dash_req()
sheets = list(map(lambda x: x['queryName'], dashrequest['requests']))

dashjson = get_dash_data()
datas = list(map(lambda x: x['data'], dashjson))
# datas = list(range(len(sheets)))

sheet2data = group_sheet_data(sheets, datas)

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

    links = [('out/covid.xlsx', 'XLS with sheets'), ('out/covid.csv', 'CSV containing all')]
    links += [(f'out/csv/{sheetname}.csv', f'{sheetname}') for sheetname, data in sheet2data]
    utils.create_index_html(links)