import csv

with open('jsons/cbs_population_2020.csv', 'r') as cbs:
    cities = list(csv.DictReader(cbs))
i = 0
with open('out/csv/contagionDataPerCityPublic.csv', 'r') as cbs:
    for row in csv.DictReader(cbs):
        # print(row)
        found = [c['Locality Name Hebrew'] for c in cities if c['Locality Name Hebrew'] == row['city']]
        # print(found)
        if len(found) == 0:
            i += 1
            print(row['city'])
print(i)
