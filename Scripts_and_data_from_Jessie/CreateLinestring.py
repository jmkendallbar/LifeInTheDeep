import requests, json, copy, os

SEAL = 'test33_HypoactiveHeidi'
BASE_URL = 'http://awesome-compute.sdsc.edu:8000/v1'
OUTPUT_BASE = '../simplified-seal-track'

BASE_GEOJSON = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
}

def get_data(start_time="2021-04-22", end_time="2021-04-23", step=10):
    url = f'{BASE_URL}/hypnop/{SEAL}?start_time={start_time}&end_time={end_time}&auth_status=true'
    response = requests.get(url)
    response = json.loads(response.content.decode('utf-8'))
    print(len(response))
    new_geojson = copy.deepcopy(BASE_GEOJSON)
    new_geojson['geometry']['coordinates'] = [[t['Long'], t['Lat']] for idx, t in enumerate(response) if idx % step == 0]
    with open(os.path.join(OUTPUT_BASE, f'{SEAL}.geojson'), 'w') as f:
        f.write(json.dumps(new_geojson))
    
get_data()