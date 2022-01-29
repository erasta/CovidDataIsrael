import csv
import json
import math
import os
import urllib
from datetime import datetime

from xlsxwriter import Workbook
from fuse_data import fuse_data

import utils
import xlscolumn
from dashreq import get_dash_data, get_dash_req

os.makedirs('out/csv', exist_ok=True)

# url = "https://datadashboardapi.health.gov.il/api/queries/tileDisplay"

def last_update_remote():
    url = "https://datadashboardapi.health.gov.il/api/queries/lastUpdate"
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
    req = urllib.request.Request(url, headers=headers)
    lastUpdateRemoteJson = urllib.request.urlopen(req).read().decode("utf-8")
    return json.loads(lastUpdateRemoteJson)[0]['lastUpdate']


def last_update_local():
    try:
        with open('out/csv/lastUpdate.csv', newline='') as lastUpdateFile:
            reader = csv.DictReader(lastUpdateFile)
            for row in reader:
                return row['lastUpdate']
    except FileNotFoundError:
        pass
    return None


# lastUpdateRemote = str(last_update_remote()).strip()
# lastUpdateLocal = str(last_update_local()).strip()
# if lastUpdateLocal == lastUpdateRemote:
#     print('local == remote, stoping.', lastUpdateLocal, lastUpdateRemote)
#     # exit()
# print('local != remote, continuing.', lastUpdateLocal, lastUpdateRemote)

with open('jsons/mohfiles.json') as f:
    mohfiles = json.load(f)
    for moh in mohfiles:
        print(moh['name'], moh['asset'])
        try:
            url = "https://data.gov.il/api/3/action/datastore_search?resource_id=" + moh["asset"] + "&limit=9999"
            text = urllib.request.urlopen(url).read().decode('utf-8')
            jsonobj = json.loads(text)
            data = jsonobj['result']['records']
            data, fields = utils.data2fields(data)
            with open('out/csv/' + moh['name'] + '.csv', 'w') as csvfile:
                utils.writeToCsv(data, fields, csvfile)
        except urllib.request.HTTPError as err:
            print("HTTPError: {0}".format(err))
        finally:
            pass







dashrequest = get_dash_req()
for r in dashrequest['requests']:
    print(r['id'], r['queryName'])
# print(json.dumps(dashrequest, indent=4, sort_keys=True))
# exit()
sheets = list(map(lambda x: x['queryName'], dashrequest['requests']))

dashjson = get_dash_data()
# print(dashjson)
datas = list(map(lambda x: x['data'] if 'data' in x else None, dashjson))

sheet2data = utils.group_sheet_data(sheets, datas)

histdir = 'out/history/' + datetime.now().strftime('%Y-%m-%d')
os.makedirs(histdir, exist_ok=True)
for i, (sheetname, data) in enumerate(sheet2data):
    if data is not None:
        data, fields = utils.data2fields(data)
        print(i, sheetname, fields)

        with open('out/csv/' + sheetname + '.csv', 'w') as csvfile:
            utils.writeToCsv(data, fields, csvfile)

        with open(histdir + '/' + sheetname + '.csv', 'w') as csvfile:
            utils.writeToCsv(data, fields, csvfile)

with open('out/history/dates.json', 'w') as datesfile:
    histdirs = sorted(next(os.walk('out/history'))[1])
    str = json.dumps(histdirs, sort_keys=True, indent=2)
    datesfile.write(str)

# url = "https://raw.githubusercontent.com/yuval-harpaz/covid-19-israel-matlab/master/data/Israel/delta.csv"
# text = urllib.request.urlopen(url).read().decode('utf-8')
# print('harpaz_moiz')
# with open('out/csv/harpaz_moiz.csv', 'w') as csvfile:
#     csvfile.write(text)

print("fusing data for all_dashboard_timeseries")
fused = fuse_data(sheet2data)

print("writing all_dashboard_timeseries.csv")
with open('out/csv/all_dashboard_timeseries.csv', 'w') as csvfile:
    utils.writeToCsv(list(fused), list(fused[0].keys()), csvfile)

with open(histdir + '/all_dashboard_timeseries.csv', 'w') as csvfile:
    utils.writeToCsv(list(fused), list(fused[0].keys()), csvfile)
