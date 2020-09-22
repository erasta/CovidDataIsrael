import requests
import json

def get_dash_data():
    url = "https://datadashboardapi.health.gov.il/api/queries/_batch"

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

        payload = {"requests":[{"id":"0","queryName":"lastUpdate","single":True,"parameters":{}},{"id":"1","queryName":"infectedPerDate","single":False,"parameters":{}},{"id":"2","queryName":"updatedPatientsOverallStatus","single":False,"parameters":{}},{"id":"3","queryName":"sickPerDateTwoDays","single":False,"parameters":{}},{"id":"4","queryName":"sickPatientPerLocation","single":False,"parameters":{}},{"id":"5","queryName":"patientsPerDate","single":False,"parameters":{}},{"id":"6","queryName":"deadPatientsPerDate","single":False,"parameters":{}},{"id":"7","queryName":"recoveredPerDay","single":False,"parameters":{}},{"id":"8","queryName":"testResultsPerDate","single":False,"parameters":{}},{"id":"9","queryName":"infectedPerDate","single":False,"parameters":{}},{"id":"10","queryName":"patientsPerDate","single":False,"parameters":{}},{"id":"11","queryName":"infectedByAgeAndGenderPublic","single":False,"parameters":{"ageSections":[0,10,20,30,40,50,60,70,80,90]}},{"id":"12","queryName":"isolatedDoctorsAndNurses","single":True,"parameters":{}},{"id":"13","queryName":"testResultsPerDate","single":False,"parameters":{}},{"id":"14","queryName":"contagionDataPerCityPublic","single":False,"parameters":{}},{"id":"15","queryName":"hospitalStatus","single":False,"parameters":{}},{"id":"16","queryName":"doublingRate","single":False,"parameters":{}},{"id":"17","queryName":"patientsPerDate","single":False,"parameters":{}},{"id":"18","queryName":"updatedPatientsOverallStatus","single":False,"parameters":{}},{"id":"19","queryName":"CalculatedVerified","single":False,"parameters":{}}]}
        # payload = {"requests": [{"id": "0", "queryName": "lastUpdate", "single": True, "parameters": {}}]}
        # payload = {"requests": [{"id": "0", "queryName": "lastUpdate", "single": True, "parameters": {}}]}
        r2 = session.post(url, json=payload, headers=header)
        # r2 = session.post(url, headers=header)
        return r2.json(), payload
