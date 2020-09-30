import csv
import json
import math
import os
import urllib
from datetime import datetime

from xlsxwriter import Workbook

import utils
import xlscolumn
from dashreq import get_dash_data, get_dash_req


def write_json_to_csvs(sheet2data, timestamp):
    histdir = 'out/history/' + timestamp.strftime('%Y-%m-%d')
    os.makedirs(histdir, exist_ok=True)
    os.makedirs('out/csv', exist_ok=True)
    for i, (sheetname, data) in enumerate(sheet2data):
        data, fields = utils.data2fields(data)
        print(i, sheetname, fields)

        with open('out/csv/' + sheetname + '.csv', 'w') as csvfile:
            utils.writeToCsv(data, fields, csvfile)

        with open(histdir + '/' + sheetname + '.csv', 'w') as csvfile:
            utils.writeToCsv(data, fields, csvfile)


def write_dates_json():
    histdirs = sorted(next(os.walk('out/history'))[1])
    print('histdir:', len(histdirs))
    with open('out/history/dates.json', 'w') as datesfile:
        str = json.dumps(histdirs, sort_keys=True, indent=2)
        datesfile.write(str)


def parse_old_jsons():
    folder = 'oldjsons'
    oldjsons = sorted([f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))])

    for oldfilename in oldjsons:
        tsstr = os.path.splitext(oldfilename)[0]
        timestamp = datetime.strptime(tsstr, "%Y-%m-%dT%H:%M:%S.%fZ")
        print(str(timestamp))

        with open(os.path.join(folder, oldfilename), 'r') as jsonfile:
            datajson = json.load(jsonfile)
            sheet2data = []
            for key in datajson:
                sheet2data.append((key, datajson[key]))
                print(key)

            write_json_to_csvs(sheet2data, timestamp)
            # exit()

    write_dates_json()


parse_old_jsons()
