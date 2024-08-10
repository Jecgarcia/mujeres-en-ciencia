//Halar las funciones que se utilizan desde d3
const {json, select, selectAll, geoOrthographic, geoPath, geoGraticule} = d3;
const globeContainer = document.getElementById('mapSpace');

// Definir los países de interés, que son aquellos donde nacieron las cientificas que exploramos en el proyecto
const countriesOfInterest = [
    "United Kingdom", "Colombia", "Egypt", "Germany", "Austria",
    "United States", "France", "Italy"
];

// Cargar los datos GeoJSON completos, que es la información que permite renderizar todos los países del mundo en forma de globo terraqueo
json('../JSON/custom.geo.json').then(data => init(data));

//Definición de las variables que permiten crear la proyeccion del mapa
let geojson, 
    globe, 
    projection, 
    path, 
    graticule, 
    isMouseDown = false, 
    rotation = {x:0, y:0};

//definición del tamaño del globo
const globeSize = {
    w: window.innerWidth / 2,
    h: window.innerHeight / 1.5
};

//Definir las funciones que se van a ejecutar cuando inicie el programa
const init = data => {
    geojson = data;
    drawGlobe();
    drawGraticule();
    createHoverEffect();
    createDraggingEvents(); 
};

//Renderizar el globo terraqueo con lo preestablecido en la libreria d3
const drawGlobe = () => {
    globe = d3.select('#mapSpace')
        .append('svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
        .attr('class', 'world');

    projection = geoOrthographic()
        .fitSize([globeSize.w, globeSize.h], geojson)
        .translate([window.innerWidth - globeSize.w, window.innerHeight - globeSize.h]);

    path = geoPath().projection(projection);

    globe
        .selectAll('path')
        .data(geojson.features)
        .enter().append('path')
        .attr('d', path)
        .style('fill', function(d) {
            return countriesOfInterest.includes(d.properties.name) ? "steelblue" : "#aaa1c8";
        })
        .style('stroke', '#7f7a7a')
        .attr('class', 'country');
};

//Renderizar la reticula que permite la ubicacion y el movimiento del globo
const drawGraticule = () => {
    graticule = geoGraticule();

    globe
        .append('path')
        .attr('class', 'graticule')
        .attr('d', path(graticule()))
        .attr('fill', 'none')
        .attr('stroke', '#232323');
};

const createHoverEffect = () => {
    // Aquí se agregan efectos al pasar el ratón sobre los países
    globe.selectAll('.country')
        .on('mouseover', function(event, d) {
            // Establecer color de hover para todos los países
            d3.select(this).style('fill', 'orange');

            // Mostrar información del país en el panel de información
            if (countriesOfInterest.includes(d.properties.name)) {
                // Mostrar información específica del país si está en el array countriesOfInterest
                d3.select(this).style('fill', 'purple');
                d3.select(this).style('stroke', 'white');
            }
        })
        .on('mouseout', function(event, d) {
            // Restaurar color original al retirar el cursor
            d3.select(this).style('fill', function(d) {
                return countriesOfInterest.includes(d.properties.name) ? "steelblue" : "#aaa1c8";
            });
        });
};

//Información a mostrar cada vez que se hace hover sobre el pais de alguna cientifica
const countryInfo = {
    "United Kingdom": "Ada Lovelace nació en Londres, Inglaterra en 1815",
    "Colombia": "Alexandra Olaya Castro nació en Bogotá, Colombia en 1976",
    "Egypt": "Hipatia de Alejandria nació en Alejandria, Egipto entre el 355 y 370 d.C. y Dorothy Crowfoot Nació en 1910 en El Cairo, Egipto, hija de un arqueólogo británico.",
    "Germany": "Emmy Noether nació en 1882 en Erlangen, Alemania,",
    "Austria": "Hedy Lamarr nació en Viena, Austria en 1914 y Lise Meitner nació en la misma ciudad en 1878",
    "United States": "Katherine Johnson nació en 1918 en White Sulphur Springs, Virginia Occidental y Rachel Carson Carson en 1907 en Springdale, Pensilvania (Estados Unidos) ",
    "France": "Marie Lavoisier nació en París, Francia en 1758",
    "Italy": "Rita Levi nació en Turin, Italia en 1909"
};

const createDraggingEvents = () => {
    globe
        .on('mousedown',() => isMouseDown = true)
        .on('mouseup', () => isMouseDown = false)
        .on('mousemove', (e) => {
            if(isMouseDown) {
                const {movementX, movementY} = e;
                rotation.x += movementX / 2; 
                rotation.y += movementY / 2; 
                projection.rotate([rotation.x, rotation.y])
                selectAll('.country').attr('d', path)
                selectAll('.graticule').attr('d', path(graticule()))
            }
        })
}

