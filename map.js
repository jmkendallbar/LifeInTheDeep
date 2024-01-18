mapboxgl.accessToken = "pk.eyJ1IjoiY2xvd3JpZSIsImEiOiJja21wMHpnMnIwYzM5Mm90OWFqaTlyejhuIn0.TXE-FIaqF4K_K1OirvD0wQ";
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12',
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

export function addXYToMap(x, y) {
    let new_geojson = base_geojson
    new_geojson.geometry.coordinates = [x, y]
    map.getSource('data').setData(new_geojson);
}