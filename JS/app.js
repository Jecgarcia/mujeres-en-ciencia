const { json, select, selectAll, geoOrthographic, geoPath, geoGraticule } = d3;
const mapSpace = document.getElementById('mapSpace');

// Definir los países de interés
const countriesOfInterest = [
    "United Kingdom", "Colombia", "Egypt", "Germany", "Austria",
    "United States", "France", "Italy"
];

// Cargar los datos GeoJSON completos que permiten el renderizado de un globo terraqueo
json('../JSON/custom.geo.json').then(data => {
    console.log(data); // Verifica que los datos se carguen correctamente
    init(data);
});

//creacion de variables necesarias para la proyeccion del globo terraqueo
let geojson, globe, projection, path, graticule, isMouseDown = false, rotation = {x: 0, y: 0};

// Definición de tamaño del SVG (globo) y márgenes
const svgWidth = 600;  // Ancho deseado para el SVG
const svgHeight = 400; // Alto deseado para el SVG
const margin = 50;     // Margen para evitar recortes

const init = data => {
    geojson = data;
    drawGlobe();
    drawGraticule();
    createHoverEffect();
    createDraggingEvents(); 
};

//Función que define como se va a crear y proyectar el globo
const drawGlobe = () => {
    globe = d3.select('#mapSpace')
        .append('svg')
        .attr('width', svgWidth + margin * 2)
        .attr('height', svgHeight + margin * 2)
        .attr('class', 'world');

    projection = geoOrthographic()
        .fitSize([svgWidth, svgHeight], geojson)
        .translate([(svgWidth + margin) / 2, (svgHeight + margin) / 2])
        .scale(svgWidth / 3);  // Ajusta la escala para reducir el tamaño del globo

    path = geoPath().projection(projection);

    globe.selectAll('path')
        .data(geojson.features)
        .enter().append('path')
        .attr('d', path)
        .style('fill', function(d) {
            return countriesOfInterest.includes(d.properties.name) ? "steelblue" : "#aaa1c8";
        })
        .style('stroke', '#7f7a7a')
        .attr('class', 'country');
};

const drawGraticule = () => {
    graticule = geoGraticule();

    globe.append('path')
        .attr('class', 'graticule')
        .attr('d', path(graticule()))
        .attr('fill', 'none')
        .attr('stroke', '#232323');
};

//comportamientos al hacer hover sobre determinados paises
const createHoverEffect = () => {
    globe.selectAll('.country')
        .on('mouseover', function(event, d) {
            d3.select(this).style('fill', 'orange');

            if (countriesOfInterest.includes(d.properties.name)) {
                d3.select(this).style('fill', 'purple');
                d3.select(this).style('stroke', 'white');
            }
        })
        .on('mouseout', function(event, d) {
            d3.select(this).style('fill', function(d) {
                return countriesOfInterest.includes(d.properties.name) ? "steelblue" : "#aaa1c8";
            });
        });
};

const createDraggingEvents = () => {
    globe
        .on('mousedown', () => isMouseDown = true)
        .on('mouseup', () => isMouseDown = false)
        .on('mousemove', (e) => {
            if (isMouseDown) {
                const { movementX, movementY } = e;
                rotation.x += movementX / 2; 
                rotation.y += movementY / 2; 
                projection.rotate([rotation.x, rotation.y]);
                selectAll('.country').attr('d', path);
                selectAll('.graticule').attr('d', path(graticule()));
            }
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