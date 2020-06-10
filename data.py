##make dictionaries for all columns
import csv
import json
import collections
import operator
    
##with open('/Users/Jia/Documents/map_corporations/data/temp/lazips_temp.csv', 'rb') as csvfile:
with open('transit.csv', 'rb') as csvfile:
    spamreader = csv.reader(csvfile)
    
    #for nycZip in nycZips_geo:
        
    geoidDict = {}
    for row in spamreader:
        header = row
        break        
    
    for row in spamreader:        
        geoidDict[row[0]]=[row[1],row[2],round(float(row[3]),3)]
     
    
    

with open("svi_transit - SVI2018_US_reduced.csv","rb")as sviFile:
    sviReader = csv.reader(sviFile)
    
    for row in sviReader:
        header = row
        newHeader = header+["popAbove16","public transit","percent pt"]
        break
    
    with open("combined.csv","wb")as outfile:
        combinedWriter = csv.writer(outfile)
        combinedWriter.writerow(newHeader)
        
        for row in sviReader:
            geoid = row[5]
            if geoid in geoidDict.keys():
                newRow = row+geoidDict[geoid]
                combinedWriter.writerow(newRow)
            
