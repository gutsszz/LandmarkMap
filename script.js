mapboxgl.accessToken = 'pk.eyJ1IjoidGFsaGF3YXFxYXMxNCIsImEiOiJjbHBreHhscWEwMWU4MnFyenU3ODdmeTdsIn0.8IlEgMNGcbx806t363hDJg';

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2hR05_jufA1yO5yTBVlsnxxDnagXubgCyqHXmhlZZVh9MfxZ2l7dtDKRDHKKB7kCpfgsAcD7nYRop/pub?gid=0&single=true&output=csv';
let map;
let constructionSlider ;
let demolitionSlider ;
let constrctionInteract = false;
let demolitionInteract = false;
let geojsonData = { type: 'FeatureCollection', features: [] };

async function fetchCSVData() {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    return csvText.split('\n').map(row => row.split(','));
}

function parseCSVData(data) {
    const headers = data[0].map(header => header.trim());
    const geojson = {
        type: 'FeatureCollection',
        features: data.slice(1).map(row => {
            const lat = parseFloat(row[0].trim());
            const lng = parseFloat(row[1].trim());
            if (isNaN(lat) || isNaN(lng)) {
                return null;
            }
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                properties: headers.reduce((acc, header, i) => {
                    acc[header] = row[i].trim();
                    return acc;
                }, {})
            };
        }).filter(feature => feature !== null)
    };
    
   
    return geojson;
}
function createMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/talhawaqqas14/cm7m8w40a000x01qu43mdcrln',
        center: [0, 25],
        zoom: 1.5
    });
}

function addMarkers(geojson) {
    
    document.querySelectorAll('.marker').forEach(marker => marker.remove());

    geojson.features.forEach(function (marker) {
        var el = document.createElement('div');
        el.className = 'marker bg-red-500 rounded-full w-4 h-4 cursor-pointer';

        new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);

        el.addEventListener('click', function () {
            const imgUrl = marker.properties.photos;
            const designer = marker.properties.Designer;
            const style = marker.properties.style;
            const yearConstructed = marker.properties.Year_constructed;
            const yearDemolished = marker.properties.Year_demolished;
            const country = marker.properties.country;
            const name = marker.properties.Landmark;

            console.log('Photo URL:', imgUrl);
            document.getElementById('popup-image').src = imgUrl;
            document.getElementById('popup-title').innerText = name;
            document.getElementById('popup-text').innerHTML = `
<div class="space-y-3 h-80 overflow-y-auto">
    <div class="border-b border-gray-200 pb-2">
        <h5 class="text-sm font-semibold text-gray-800">Designer</h5>
        <p class="text-gray-600 text-sm">${designer}</p>
    </div>
    <div class="border-b border-gray-200 pb-2">
        <h5 class="text-sm font-semibold text-gray-800">Style</h5>
        <p class="text-gray-600 text-sm">${style}</p>
    </div>
    <div class="border-b border-gray-200 pb-2">
        <h5 class="text-sm font-semibold text-gray-800">Year Constructed</h5>
        <p class="text-gray-600 text-sm">${yearConstructed}</p>
    </div>
    <div class="border-b border-gray-200 pb-2">
        <h5 class="text-sm font-semibold text-gray-800">Year Demolished</h5>
        <p class="text-gray-600 text-sm">${yearDemolished}</p>
    </div>
    <div class="border-b border-gray-200 pb-2">
        <h5 class="text-sm font-semibold text-gray-800">Year Demolished</h5>
        <p class="text-gray-600 text-sm">ashbdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd</p>
    </div>
    <div class="border-b border-gray-200 pb-2">
        <h5 class="text-sm font-semibold text-gray-800">Year Demolished</h5>
        <p class="text-gray-600 text-sm">${yearDemolished}</p>
    </div>
    <div>
        <h5 class="text-sm font-semibold text-gray-800">Country</h5>
        <p class="text-gray-600 text-sm">${country}</p>
    </div>
</div>
            `;
            document.getElementById('popup-container').style.display = 'flex';
        });
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, 3000);
}

function filterMarkersByConstructionSlider() {
   
  console.log('Construction Slider Value:', constructionSlider);

const filteredGeojson = {
    type: 'FeatureCollection',
    features: geojsonData.features.filter(feature => {
        const yearConstructed = parseInt(feature.properties.Year_constructed, 10);
        const inConstructionRange = constructionSlider === null || yearConstructed === constructionSlider;
        return inConstructionRange;
    })
};

addMarkers(filteredGeojson);
}


function filterMarkersByDemolitionSlider() {
    console.log('Demolition Slider Value:', demolitionSlider);

    const filteredGeojson = {
        type: 'FeatureCollection',
        features: geojsonData.features.filter(feature => {
            const yearDemolished = parseInt(feature.properties.Year_demolished, 10);
            const inDemolitionRange = demolitionSlider === null || yearDemolished === demolitionSlider;
            return inDemolitionRange;
        })
    };

    addMarkers(filteredGeojson);
}



function filterMarkersByBothSliders() {

   constructionSlider = document.getElementById('construction_date_slider').value ? parseInt(document.getElementById('construction_date_slider').value, 10) : null;
   demolitionSlider = document.getElementById('demolition_date_slider').value ? parseInt(document.getElementById('demolition_date_slider').value, 10) : null;


    console.log('Construction Slider Value:', constructionSlider);
    console.log('Demolition Slider Value:', demolitionSlider);

    const filteredGeojson = {
        type: 'FeatureCollection',
        features: geojsonData.features.filter(feature => {
            const yearConstructed = parseInt(feature.properties.Year_constructed, 10);
            const yearDemolished = parseInt(feature.properties.Year_demolished, 10);

            const inConstructionRange = constructionSlider === null || yearConstructed === constructionSlider;
            const inDemolitionRange = demolitionSlider === null || yearDemolished === demolitionSlider;

            return inConstructionRange && inDemolitionRange;
        })
    };

    addMarkers(filteredGeojson);
}

function filterMarkers() {
    const selectedCountry = document.getElementById('country_input').value;
    const selectedDesigner = document.getElementById('designer_input').value;
    const selectedStyle = document.getElementById('style_input').value;

    const constructionLower = parseInt(document.getElementById('construction_date_lower').value, 10);
    const constructionUpper = parseInt(document.getElementById('construction_date_upper').value, 10);

    const demolitionLower = parseInt(document.getElementById('demolition_date_lower').value, 10);
    const demolitionUpper = parseInt(document.getElementById('demolition_date_upper').value, 10);

    const filteredGeojson = {
        type: 'FeatureCollection',
        features: geojsonData.features.filter(feature => {
            const matchesCountry = selectedCountry === '' || feature.properties.country === selectedCountry;
            const matchesDesigner = selectedDesigner === '' || feature.properties.Designer === selectedDesigner;
            const matchesStyle = selectedStyle === '' || feature.properties.style === selectedStyle;

            const yearConstructed = parseInt(feature.properties.Year_constructed, 10);
            const yearDemolished = parseInt(feature.properties.Year_demolished, 10);

            const inConstructionRange = isNaN(constructionLower) || isNaN(constructionUpper) || (yearConstructed >= constructionLower && yearConstructed <= constructionUpper);
            const inDemolitionRange = isNaN(demolitionLower) || isNaN(demolitionUpper) || (yearDemolished >= demolitionLower && yearDemolished <= demolitionUpper);

            return matchesCountry && matchesDesigner && matchesStyle && inConstructionRange && inDemolitionRange;
        })
    };

    addMarkers(filteredGeojson);

    if (filteredGeojson.features.length === 0) {
        showNotification('No landmarks match your search criteria.');
    } else {
        fitMapToBounds(filteredGeojson.features);
    }
}



function fitMapToBounds(features) {
    if (features.length === 1) {
        const feature = features[0];
        const [lng, lat] = feature.geometry.coordinates;
        map.flyTo({
            center: [lng, lat],
            zoom: 16, 
            speed: 4, 
            curve: 1, 
            easing: function (t) {
                return t; 
            }
        });
        return;
    }
    const bounds = new mapboxgl.LngLatBounds();
    features.forEach(feature => bounds.extend(feature.geometry.coordinates));
    map.fitBounds(bounds, { padding: 50, duration: 1000 });
}

function populateInputBoxes() {
    const countries = new Set();
    const designers = new Set();
    const styles = new Set();

    geojsonData.features.forEach(feature => {
        if (feature.properties.country) {
            countries.add(feature.properties.country);
        }
        if (feature.properties.Designer) {
            designers.add(feature.properties.Designer);
        }
        if (feature.properties.style) {
            styles.add(feature.properties.style);
        }
    });

    const populateDatalist = (id, values) => {
        const datalist = document.getElementById(id);
        datalist.innerHTML = '';
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            datalist.appendChild(option);
        });
    };

    populateDatalist('country_list', Array.from(countries));
    populateDatalist('designer_list', Array.from(designers));
    populateDatalist('style_list', Array.from(styles));
}

function updateConstructionDateSlider() {
    const lower = parseInt(document.getElementById('construction_date_lower').value, 10);
    const upper = parseInt(document.getElementById('construction_date_upper').value, 10);
    const slider = document.getElementById('construction_date_slider');

    if (!isNaN(lower) && !isNaN(upper) && lower <= upper) {
        slider.min = lower;
        slider.max = upper;
        slider.value = ''; 
        filterMarkers();
    }
}

function updateDemolitionDateSlider() {
    const lower = parseInt(document.getElementById('demolition_date_lower').value, 10);
    const upper = parseInt(document.getElementById('demolition_date_upper').value, 10);
    const slider = document.getElementById('demolition_date_slider');

    if (!isNaN(lower) && !isNaN(upper) && lower <= upper) {
        slider.min = lower;
        slider.max = upper;
        slider.value = ''; 
        filterMarkers();
    }
}

function updateConstructionDateLabel() {
  constrctionInteract=true;
  constructionSlider = document.getElementById('construction_date_slider').value ? parseInt(document.getElementById('construction_date_slider').value, 10) : null;
  if (!demolitionInteract){
  filterMarkersByConstructionSlider();
  }
else filterMarkersByBothSliders;

}

function updateDemolitionDateLabel() {
  demolitionInteract=true;

  
  demolitionSlider = document.getElementById('demolition_date_slider').value ? parseInt(document.getElementById('demolition_date_slider').value, 10) : null;
  
  if(!constrctionInteract){filterMarkersByDemolitionSlider();}
  else filterMarkersByBothSliders();
}

document.getElementById('construction_date_slider').addEventListener('input', updateConstructionDateLabel);
document.getElementById('demolition_date_slider').addEventListener('input', updateDemolitionDateLabel);


function showTooltip(event, tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    const slider = event.target;
    const value = slider.value || '---';
    const rect = slider.getBoundingClientRect();
    const sliderWidth = rect.width;
    const thumbWidth = 20; 


    tooltip.textContent = value;

    
    const percent = (value === '---') ? 0 : (value - slider.min) / (slider.max - slider.min);
    const tooltipX = percent * sliderWidth;
    tooltip.style.left = `calc(${tooltipX}px + ${thumbWidth / 2}px)`;
    tooltip.style.top = `-30px`; 
    tooltip.classList.remove('hidden');
}

function hideTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    tooltip.classList.add('hidden');
}

document.getElementById('construction_date_slider').addEventListener('input', function (event) {

    showTooltip(event, 'construction_date_tooltip');
});

document.getElementById('demolition_date_slider').addEventListener('input', function (event) {
    showTooltip(event, 'demolition_date_tooltip');
});

document.getElementById('construction_date_slider').addEventListener('mouseleave', function () {
    hideTooltip('construction_date_tooltip');
    

});

document.getElementById('demolition_date_slider').addEventListener('mouseleave', function () {
    hideTooltip('demolition_date_tooltip');

  

});

async function initializeMap() {
    const data = await fetchCSVData();
    geojsonData = parseCSVData(data);
    createMap();
    addMarkers(geojsonData);
    populateInputBoxes(); 
}

document.getElementById('close-popup').addEventListener('click', function () {
    document.getElementById('popup-container').style.display = 'none';
});

document.getElementById('toggle-sidebar').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
    map.resize();
});

function clearInput(id) {
    const input = document.getElementById(id);
    input.value = '';
    filterMarkers();
}

document.getElementById('reset-filters-button').addEventListener('click', function () {
  constrctionInteract=false;
  demolitionInteract=false;
    document.getElementById('country_input').value = '';
    document.getElementById('designer_input').value = '';
    document.getElementById('style_input').value = '';
    document.getElementById('construction_date_lower').value = '';
    document.getElementById('construction_date_upper').value = '';
    document.getElementById('demolition_date_lower').value = '';
    document.getElementById('demolition_date_upper').value = '';
    document.getElementById('construction_date_slider').value = '';
    document.getElementById('demolition_date_slider').value = '';
    addMarkers(geojsonData);
});

document.getElementById('zoom-default-button').addEventListener('click', () => {
    map.flyTo({
        center: [0, 25],
        zoom: 1.5,
        speed: 4
    });
});

document.getElementById('country_input').addEventListener('input', filterMarkers);
document.getElementById('designer_input').addEventListener('input', filterMarkers);
document.getElementById('style_input').addEventListener('input', filterMarkers);
document.getElementById('construction_date_lower').addEventListener('input', filterMarkers);
document.getElementById('construction_date_upper').addEventListener('input', filterMarkers);
document.getElementById('demolition_date_lower').addEventListener('input', filterMarkers);
document.getElementById('demolition_date_upper').addEventListener('input', filterMarkers);

initializeMap();
