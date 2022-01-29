import requests
import json

url = "https://datadashboardapi.health.gov.il/api/queries/_batch"

def get_dash_data():
    # return json.load(open('samples/data-09-23.json', 'r'))

    with requests.session() as session:
        header = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
            "Access-Control-Request-Method": "POST",
            "Connection": "keep-alive",
            "Host": "datadashboardapi.health.gov.il",
            "Origin": "https://datadashboard.health.gov.il",
            "Referer": "https://datadashboard.health.gov.il/COVID-19/?utm_source=go.gov.il&utm_medium=referral",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36"
        }
        r = session.options(url=url, headers=header)

        header = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Content-Length": "1572",
            "Content-Type": "application/json",
            "Host": "datadashboardapi.health.gov.il",
            "Origin": "https://datadashboard.health.gov.il",
            "Referer": "https://datadashboard.health.gov.il/COVID-19/?utm_source=go.gov.il&utm_medium=referral",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0",
        }

        payload = get_dash_req()
        r2 = session.post(url, json=payload, headers=header)
        return r2.json()


def get_dash_req():
    with open('jsons/dashreq.json') as f:
        req = json.load(f)
    # with open('jsons/currdashreq.json') as f:
    #     curr = json.load(f)
    # reqQueries = [x['queryName'] for x in req['requests']]
    # changed = False
    # for c in curr['requests']:
    #     if c['queryName'] not in reqQueries:
    #         m = max([int(x['id']) for x in req['requests']])
    #         c['id'] = str(m + 1)
    #         req['requests'] += [c]
    #         changed = True

    # i = 1
    # for c in req['requests']:
    #     c['id'] = str(i)
    #     i += 1

    # # if changed:
    # with open('jsons/dashreq.json', 'w') as f:
    #     json.dump(req, f, indent=4)

    return req


if __name__ == '__main__':
    r = get_dash_req()
    print('=-=-=-=-')
    r['requests'] = r['requests']
    print(json.dumps(r, indent=4, sort_keys=True))
    print('........')
    data = requests.post(url, json=r).json()

    # ids_to_del = []
    for c in data:
        if 'error' in c:
            print(c)
    #         ids_to_del += [c['id']]
    #     # d = str(c)
    #     # if len(d) < 100:
    #     #     print(c)
    # print (ids_to_del)
    # r['requests'] = [x for x in r['requests'] if x['id'] not in ids_to_del]
    # print(json.dumps(r, indent=4, sort_keys=True))

    # i = 1
    # for c in r['requests']:
    #     c['id'] = str(i)
    #     i += 1

    # # if changed:
    # with open('jsons/dashreq.json', 'w') as f:
    #     json.dump(r, f, indent=4)

    # print('********')

    # for c in r['requests']:
    #     print(c)
    # print('********')
