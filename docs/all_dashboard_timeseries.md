# Table "[all_dashboard_timeseries.csv](https://github.com/erasta/CovidDataIsrael/blob/master/out/csv/all_dashboard_timeseries.csv)"
## Variable names, their meaning, and sources. 
The table is based on Israel Ministry of Health's [dashboard](https://datadashboard.health.gov.il/COVID-19/general?utm_source=go.gov.il&utm_medium=referral). The data is available as different json files with an address starting with _https://datadashboardapi.health.gov.il/api/queries/_, followed by the names specified below.  

| Variable | description | json | field |
| ------ | ------ | - | - |
| date | yyyy-mm-dd | infectedPerDate | amount |
| cases | positive PCR and Antigen tests by reported date | infectedPerDate | amount |
| recovered | recovered cases | infectedPerDate | recovered |
| tests | PCR and Antigen tests for COVID diagnosis (not recovery) |infectedPerDate | amountPersonTested |
| positiveRate | percent positive tests = 100×cases/tests | infectedPerDate | positiveRate|
| positiveRatePCR | percent positive PCR tests | infectedPerDate | positiveRatePCR|
| positiveRateAntigen | percent positive Antigen tests | infectedPerDate | positiveRateAntigen|
| deaths | deaths by date of death | deadPatientsPerDate | amount |
| countHardStatus | hospitalized severely ill patients (low oxygenation, PaO2/FiO2 < 300) | hospitalizationStatusDaily | countHardStatus |
| countMediumStatus | hospitalized in medium condition (COVID19 + pneumonia) | hospitalizationStatusDaily | countMediumStatus |
| countEasyStatus | hospirtalized in mild condition (some COVID19 symptoms) | hospitalizationStatusDaily | countEasyStatus |
| severe_new | new hospitalized patients in severe condition | patientsPerDate | severe_new |
| medium_new | new hospitalized patients in medium condition (may have improved from severe)| patientsPerDate | medium_new |
| easy_new | new hospitalized patients in mild condition (may have improved from mild or severe)| patientsPerDate | easy_new |
| countBreath | mechanically ventilated patients | hardPatient | countBreath |
| countCriticalStatus | hospitalized in critical condition (system failure- heart, lungs, kidneys...). usually in ICU | hardPatient | countCriticalStatus |
| countEcmo | patients connected to ECMO | hardPatient | countEcmo |
| CountBreathCum | cumulative mechanically ventilated patients | N.A. | N.A. |
| new_hospitalized | new hospital admissions | N.A. | manually typed [here](https://github.com/yuval-harpaz/covid-19-israel-matlab/blob/master/data/Israel/dashboard_timeseries.csv) |


