'use strict';

const urlParams = new URLSearchParams(window.location.search);
var flightNo = urlParams.get('flight_no');
var initDateTime = urlParams.get('init_dateTime');
var estDateTime = urlParams.get('est_dateTime');

var origin_lng = parseFloat(urlParams.get('src_lng') + "");
var origin_lat = parseFloat(urlParams.get('src_lat') + "");
var origin_name = urlParams.get('src_name');
var origin_country = urlParams.get('src_country');
var origin_dateTime = urlParams.get('src_time');

var destination_lng = parseFloat(urlParams.get("dst_lng") + "");
var destination_lat = parseFloat(urlParams.get("dst_lat") + "");
var destination_name = urlParams.get("dst_name");
var destination_country = urlParams.get('dst_country');
var destination_dateTime = urlParams.get('dst_time');

var date = urlParams.get('date');
var class_name = urlParams.get('class_name');

if (!!flightNo)
    document.getElementById('flight-no').innerHTML = flightNo
if (!!origin_name)
    document.getElementById('src-name').innerHTML = origin_name
if (!!destination_name)
    document.getElementById('dst-name').innerHTML = destination_name
if (!!origin_country)
    document.getElementById('src-country-code').innerHTML = origin_country
if (!!destination_country)
    document.getElementById('dst-country-code').innerHTML = destination_country
if (!!origin_dateTime)
    document.getElementById('src-time').innerHTML = origin_dateTime
if (!!destination_dateTime)
    document.getElementById('dst-time').innerHTML = destination_dateTime
if (!!date)
    document.getElementById('date').innerHTML = date
if (!!class_name)
    document.getElementById('class-name').innerHTML = class_name

var origin = [origin_lng, origin_lat];
var destination = [destination_lng, destination_lat];
// var origin = [103.989441, 1.359167]; // Singapore Changi Airport
// var destination = [144.844788, -34.663712]; // Melbourne Airport
// var destination = [116.597504, 40.072498]; // Beijing Airport

mapboxgl.accessToken = 'pk.eyJ1IjoicmV2bW9uLXp5IiwiYSI6ImNqeTlseGNtYzA1aXIzbXNhenl6Zm5vNmYifQ.fknPvSAb-4s4nLICGoG5OQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: origin,
    zoom: 4,
    attributionControl: false,
});

var size = 100;
var circleDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = size / 2 * 0.3;
        var context = this.context;

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 159, 0, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4;
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // keep the map repainting
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};
var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = size / 2 * 0.3;
        var outerRadius = size / 2 * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 159, 0,' + (1 - t) + ')';
        context.fill();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // keep the map repainting
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};
var pulsingGreenDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = size / 2 * 0.3;
        var outerRadius = size / 2 * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(9, 188, 138,' + (1 - t) + ')';
        context.fill();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // keep the map repainting
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};
// A simple line from origin to destination.
var route = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                origin,
                destination
            ]
        }
    }]
};

// A single point that animates along the route.
// Coordinates are initially set to origin.
var point = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": origin
        }
    }]
};

// A single line from origin to point
var travelled_route = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                origin,
                point
            ]
        }
    }]
};

// Calculate the distance in kilometers between route start/end point.
var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

var arc = [];

// Number of steps to use in the arc and animation, more steps means
// a smoother arc and animation, but too many steps will result in a
// low frame rate
var steps = 800;

// Draw an arc between the `origin` & `destination` of the two points
for (var i = 0; i < lineDistance; i += lineDistance / steps) {
    var segment = turf.along(route.features[0], i, 'kilometers');
    arc.push(segment.geometry.coordinates);
}

// Update the route with calculated arc coordinates
route.features[0].geometry.coordinates = arc;

// Used to increment the value of the point measurement against the route.
var counter = 0;
var duration = (estDateTime / Date.now()) - 1;
if (duration < 0) {
    // the flight is completed
    counter = steps - 1 - 1 // this minus one is for the animate() function
    point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];
    travelled_route.features[0].geometry.coordinates[1] = route.features[0].geometry.coordinates[counter];
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: route.features[0].geometry.coordinates[counter],
        zoom: 4,
        attributionControl: false,
    });
} else {
    counter = parseInt((duration * 800 * 100) * steps, 10)
    // the flight is incomplete
    point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];
    travelled_route.features[0].geometry.coordinates[1] = route.features[0].geometry.coordinates[counter];
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: route.features[0].geometry.coordinates[counter],
        zoom: 4,
        attributionControl: false,
    });
}

map.on('load', function () {
    // Add a image
    map.addImage('marker-point', circleDot, { pixelRatio: 2});
    map.addImage('marker-point-dst', circleDot, { pixelRatio: 2});
    map.addImage('beacon-point', pulsingDot, { pixelRatio: 2});

    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('route', {
        "type": "geojson",
        "data": route
    });

    map.addSource('point', {
        "type": "geojson",
        "data": point
    });

    map.addSource('travelled_route', {
        "type": "geojson",
        "data": travelled_route
    });

    map.addLayer({
        "id": "route",
        "source": "route",
        "type": "line",
        "paint": {
            "line-width": 2,
            "line-color": "#00266B"
        }
    });

    map.addLayer({
        "id": "travelled_route",
        "source": "travelled_route",
        "type": "line",
        "paint": {
            "line-width": 2.2,
            "line-color": "#FF9F00"
        }
    });

    map.addLayer({
        "id": "origin_point",
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": origin,
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "marker-point"
        }
    })

    map.addLayer({
        "id": "destination_point",
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": destination,
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "marker-point"
        }
    })

    map.addLayer({
        "id": "point",
        "source": "point",
        "type": "symbol",
        "layout": {
            "icon-size": 1,
            "icon-image": "airport-15",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });
    map.addLayer({
        "id": "point-beacon",
        "source": "point",
        "type": "symbol",
        "layout": {
            "icon-size": 1,
            "icon-image": "beacon-point",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
        }
    });

    function animate() {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc.
        point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];
        travelled_route.features[0].geometry.coordinates[1] = route.features[0].geometry.coordinates[counter];

        // Calculate the bearing to ensure the icon is rotated to match the route arc
        // The bearing is calculate between the current point and the next point, except
        // at the end of the arc use the previous point and the current point
        point.features[0].properties.bearing = turf.bearing(
            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter - 1 : counter]),
            turf.point(route.features[0].geometry.coordinates[counter >= steps ? counter : counter + 1])
        );

        // Calculate the arc of the travelled route using the same function that generate the
        // route.
        var travelled_arc = [];
        for (var i = 0; i < lineDistance; i += lineDistance / counter) {
            var segment = turf.along(travelled_route.features[0], i, 'kilometers');
            travelled_arc.push(segment.geometry.coordinates);
        }

        travelled_route.features[0].geometry.coordinates = travelled_arc;

        // Update the source with this new data.
        map.getSource('point').setData(point);
        map.getSource('travelled_route').setData(travelled_route);

        // Request the next frame of animation so long the end has not been reached.
        if (counter < steps) {
            sleep(1).then(function () {
                map.flyTo({ center: point.features[0].geometry.coordinates });
                requestAnimationFrame(animate);
            });
        }

        counter = counter + 1;
    }

    // Start the animation.
    animate(counter);
});

function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms) });
};
