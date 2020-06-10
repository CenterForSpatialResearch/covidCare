##make dictionaries for all columns
import csv
import json
import collections
import operator
    
    
#SPL_THEMES,RPL_THEMES

#COUNTY,FIPS,
#COUNTY,FIPS,


##with open('/Users/Jia/Documents/map_corporations/data/temp/lazips_temp.csv', 'rb') as csvfile:
#with open('SVI2018_TRACT.csv', 'rb') as csvfile:
#    spamreader = csv.reader(csvfile)
#    
#    #for nycZip in nycZips_geo:
#        
#    for row in spamreader:
#        header = row
#        fipsI = header.index("FIPS")
#        splI = header.index("SPL_THEMES")
#        print row
#        break        
#    
    
        
        
with open("svi_tract.geojson", "rb")as geojson:
    data = json.load(geojson)
    print data["features"][0]["properties"].keys()
    
    newdata = data
    newFeatures=[]
    print len(data["features"])
    
    for i in data["features"]:
        newfeature = i
        fips = i["properties"]["FIPS"]
        spl = i["properties"]["SPL_THEMES"]
        rpl = i["properties"]["RPL_THEMES"]
        newProp = {"FIPS":fips, "SPL_THEMES":spl,"RPL_THEMES":rpl}
        newfeature["properties"]=newProp
        newFeatures.append(newfeature)
    
    newdata["features"]=newFeatures
    
    with open('tracts.geojson', 'w') as outfile:
        json.dump(newdata, outfile)