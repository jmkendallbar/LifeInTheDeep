import { marineLifeBehaviourData } from "./main";

mapboxgl.accessToken = "pk.eyJ1IjoiY2xvd3JpZSIsImEiOiJja21wMHpnMnIwYzM5Mm90OWFqaTlyejhuIn0.TXE-FIaqF4K_K1OirvD0wQ";
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [-122.225148, 36.703337],
    zoom: 6
});

const base_geojson = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
        'type': 'Point',
        'coordinates': []
    }
}


map.on('load', () => {
    map.addSource('data', {
        'type': 'geojson',
        'data': base_geojson
    })
    map.addLayer({
        'id': 'data',
        'type': 'circle',
        'source': 'data',
        'paint': {
            'circle-color': '#888',
            'circle-radius': 8
        }
    });
})

export function addPathToMap(SealID) {
    // TODO there could be an if/then to see if the map is already loaded here
    // If loaded, add as below
    // If not loaded, add a `map.on` event handler
    map.addSource('route', {
        'type': 'geojson',
        'data': `../simplified-seal-track/${SealID}.geojson`
    });
    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#888',
            'line-width': 1
        }
    });
    // })
}

export function addXYToMap(x, y) {
    let new_geojson = base_geojson
    new_geojson.geometry.coordinates = [x, y]
    map.getSource('data').setData(new_geojson);
}