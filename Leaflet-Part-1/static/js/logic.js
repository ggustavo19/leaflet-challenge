//this function calls the quake markers in the end of the second function. See second function: createMap(L.layerGroup(quakess)
function createMap(earthquakes) { 
    // Create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    // Create a baseMaps object to hold the streetmap layer.
    let baseMaps = {
      "Street Map": streetmap
    };
    // Create an overlayMaps object to hold the bikeStations layer.
    let overlayMaps = {
      "Earthquakes": earthquakes
    };
    // Create the map object with options.
    // Connect to the html id="map" that holds our map
    let map = L.map("map", {
      center: [37.7749, -122.4194],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    //adding the legend to the map
    let legend= L.control({position:'bottomright'});
    // resources: https://gis.stackexchange.com/questions/133630/adding-leaflet-legend. Chat GPT.
    legend.onAdd= function (map) {
      let div = L.DomUtil.create('div', 'info legend'),
      grades= [0,10,30,50], //depth breakpoints
      labels= grades.map(function(grade, index) {
        let nextGrade= grades[index + 1];
        return '<i style="background:' + color(grade + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' + grade + (nextGrade ? '&ndash;' + nextGrade : '+');
      });
    div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map); // Adds legend to the map
  }

  //function to get marker color based on depth
function color(depth) {
  if (depth > 50) {
    return 'orange';
  } else if (depth > 30) {
    return 'yellow'; 
  } else if (depth > 10) {
    return 'green';
  } else {
    return 'blue'; 
  }
}

//Function to return the marker size based on maginutude
function size(magnitude) {
  return magnitude * 4;
}

function createMarkers(response) {
    //pull th feautures property data from the API JSON link
    let features= response.features;
    //initialize an array to hold earthquake markers
    let quakes= [];
    //loop through the features array.
    for (let index = 0; index < features.length; index++) {
        let feature= features[index];
        // Extract coordinates, magnitude, and depth for each earthquake
        let lon = feature.geometry.coordinates[0]; //fetch the data from the coordinates key located after features->geometry path in the json data
        let lat = feature.geometry.coordinates[1]; //fetch the data from the coordinates key located after features->geometry path in the json data
        let depth = feature.geometry.coordinates[2]; //fetch the data from the coordinates key located after features->geometry path in the json data
        let magnitude = feature.properties.mag; //fetch the data from the mag key located after features->properties path in the json data
        //create a marker for each quake and bind a popup wit the quakes data
        let quakeMarker= L.circleMarker([lat,lon], {
          color: color(depth),
          fillColor: color(depth),
          fillOpacity: 0.5,
          radius: size(magnitude)
        }).bindPopup("<h3>Magnitude: " + magnitude + "</h3><h3>Depth: " + depth + " km</h3>");
        
        quakes.push(quakeMarker);
      }
    createMap(L.layerGroup(quakes));
}


// Perform an API call to the earthquake API to get the information. Call createMarkers when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);

