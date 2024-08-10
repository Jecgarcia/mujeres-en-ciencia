const {json, select, selectAll, geoOrthographic, geoPath, geoGraticule} = d3;
const mapSpace = document.getElementById('mapSpace');

const countriesOfInterest = [
    "United Kingdom", "Colombia", "Egypt", "Germany", "Austria",
    "United States", "France", "Italy"
];

json('../JSON/custom.geo.json').then(data => {
    console.log(data); // Verifica que los datos se carguen correctamente
    init(data);
});

let geojson, globe, projection, path, graticule, isMouseDown = false, rotation = {x:0, y:0};

const globeSize = {
    w: mapSpace.clientWidth,
    h: mapSpace.clientHeight
};

const init = data => {
    geojson = data;
    drawGlobe();
    drawGraticule();
    createHoverEffect();
    createDraggingEvents(); 
};

const drawGlobe = () => {
    globe = d3.select('#mapSpace')
        .append('svg')
        .attr('width', globeSize.w)
        .attr('height', globeSize.h)
        .attr('class', 'world');

    projection = geoOrthographic()
        .fitSize([globeSize.w, globeSize.h], geojson)
        .translate([globeSize.w / 2, globeSize.h / 2]);

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
                const {movementX, movementY} = e;
                rotation.x += movementX / 2; 
                rotation.y += movementY / 2; 
                projection.rotate([rotation.x, rotation.y]);
                selectAll('.country').attr('d', path);
                selectAll('.graticule').attr('d', path(graticule()));
            }
        });
};
