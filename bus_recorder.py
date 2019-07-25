import requests, json, time, schedule, functools, threading
from datetime import datetime, timedelta 
from pymongo import MongoClient
from config import params

busposurl = 'https://api.wmata.com/Bus.svc/json/jBusPositions'
busincurl = 'https://api.wmata.com/Incidents.svc/json/BusIncidents'

def catch_exceptions(cancel_on_failure=False):
    def catch_exceptions_decorator(job_func):
        @functools.wraps(job_func)
        def wrapper(*args, **kwargs):
            try:
                return job_func(*args, **kwargs)
            except:
                import traceback
                print(traceback.format_exc())
                if cancel_on_failure:
                    return schedule.CancelJob
        return wrapper
    return catch_exceptions_decorator

@catch_exceptions(cancel_on_failure=False)
def run_threaded(job_func):
    job_thread = threading.Thread(target=job_func)
    job_thread.start()


@catch_exceptions(cancel_on_failure=False)
def getBuses():
    response = requests.get(busposurl, params=params).json()
    client = MongoClient('mongodb://localhost:27017')

    db = client['guru_db2']
    collection = db['buspos']
    acqTimeStamp = datetime.now().isoformat()[:-7]
    for bus in response['BusPositions']:
        bus['AcqTimeStamp'] = acqTimeStamp
        collection.insert_one(bus)  
    
    client.close()
    print(f"{len(response['BusPositions'])} bus location records collected.")

        
@catch_exceptions(cancel_on_failure=False)
def getBusIncidents():
    response = requests.get(busincurl, params=params).json()
    client = MongoClient('mongodb://localhost:27017')

    db = client['guru_db2']
    collection = db['businc']
    acqTimeStamp = datetime.now().isoformat()[:-7]
    for incident in response['BusIncidents']:
        incident['AcqTimeStamp'] = acqTimeStamp
        collection.insert_one(incident)  
    
    client.close()
    print(f"{len(response['BusIncidents'])} bus incident records collected.")
           
          
schedule.every(1).minute.do(run_threaded, getBusIncidents)         
schedule.every(10).seconds.do(run_threaded, getBuses)

finish_time = datetime.now() + timedelta(hours=1)
while datetime.now() < finish_time:
    schedule.run_pending()
    time.sleep(1)