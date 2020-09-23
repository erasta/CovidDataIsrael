import json
import os

from xlsxwriter import Workbook

from dashreq import get_dash_data, get_dash_req
from xlscolumn import worksheet_autowidth

dashrequest = get_dash_req()
sheets = list(map(lambda x: x['queryName'], dashrequest['requests']))
sheets = [name[0].lower() + name[1:] for name in sheets]
uniqsheets = [x for i, x in enumerate(sheets) if i == sheets.index(x)]
# datas = list(range(len(sheets)))

dashjson = get_dash_data()
datas = list(map(lambda x: x['data'], dashjson))

datazip = []
for u in uniqsheets:
    if sheets.count(u) == 1:
        datazip.append((u, datas[sheets.index(u)]))
    else:
        for occur, index in enumerate([i for i, x in enumerate(sheets) if x == u]):
            datazip.append((u + str(occur + 1), datas[index]))

os.makedirs('out', exist_ok=True)
with Workbook('out/covid.xlsx') as workbook:
    for sheetname, data in datazip:

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
