##make dictionaries for all columns
import csv
import json
import collections
import operator
import sys
csv.field_size_limit(sys.maxsize)
    
##with open('/Users/Jia/Documents/map_corporations/data/temp/lazips_temp.csv', 'rb') as csvfile:
with open('svi_2018_counties_state_ranked.csv', 'rb') as csvfile:
    spamreader = csv.reader(csvfile)
    
    #for nycZip in nycZips_geo:
        
    geoidDict = {}
    
    for row in spamreader:
        header = row
        print header
        themesStateIndex = header.index("RPL_ThemesStates")
        fipsIndex = header.index("FIPS")
        print themesStateIndex
        break        
    for row in spamreader:
        fips = row[fipsIndex]
        stateThemes = row[themesStateIndex]
      #  print fips, stateThemes
        
        geoidDict[fips]=stateThemes

#print geoidDict      
    
with open("svi_county.geojson", "rb")as geojson:
    data = json.load(geojson)
    print data["features"][0]["properties"].keys()
    
    newdata = data
    newFeatures=[]
    print len(data["features"])
    
    for i in data["features"]:
        newfeature = i
        fips = i["properties"]["FIPS"]
        
        rplState = geoidDict[fips]
        spl = i["properties"]["SPL_THEMES"]
        rpl = i["properties"]["RPL_THEMES"]
        newProp = {"FIPS":fips, "SPL_THEMES":spl,"RPL_THEMES":rpl,"RPL_THEMES_State":rplState}
        newfeature["properties"]["RPL_THEMES_State"]=float(rplState)
        newFeatures.append(newfeature)
    
    newdata["features"]=newFeatures
    
    with open('county_byState.geojson', 'w') as outfile:
        json.dump(newdata, outfile)  
    
    

