///////////////////
//// MAP STUFF ////
///////////////////

var currentYear = "2011";
var layer;
var tilesUrl = 'resources/map_tiles/{yearFolder}/{z}/{x}/{y}.png';
var tiles2003 = L.tileLayer(tilesUrl, {yearFolder: '2003'}),
    tiles2004 = L.tileLayer(tilesUrl, {yearFolder: '2004'}),
    tiles2005 = L.tileLayer(tilesUrl, {yearFolder: '2005'}),
    tiles2006 = L.tileLayer(tilesUrl, {yearFolder: '2006'}),
    tiles2007 = L.tileLayer(tilesUrl, {yearFolder: '2007'}),
    tiles2008 = L.tileLayer(tilesUrl, {yearFolder: '2008'}),
    tiles2009 = L.tileLayer(tilesUrl, {yearFolder: '2009'}),
    tiles2010 = L.tileLayer(tilesUrl, {yearFolder: '2010'}),
    tiles2011 = L.tileLayer(tilesUrl, {yearFolder: '2011'}),
    tiles2012 = L.tileLayer(tilesUrl, {yearFolder: '2012'}),
    tiles2013 = L.tileLayer(tilesUrl, {yearFolder: '2013'}),
    tiles2014 = L.tileLayer(tilesUrl, {yearFolder: '2014'}),
    tiles2015 = L.tileLayer(tilesUrl, {yearFolder: '2015'}),
    tiles2016 = L.tileLayer(tilesUrl, {yearFolder: '2016'});

// Map is absolutely positioned. Correctly positions the paragraph that follows it.
function calcMapSpacer() {
  var mapSpacer = $('#map').height() + 20;
  $('#mapSpacer').css('margin-top', mapSpacer + "px");
}

function startMap() {
  var mapMinZoom = 2;
  var mapMaxZoom = 5;
  var mapInitialZoom = mapMinZoom;

  //TODO: make it wrap better?
  L.CRS.MySimple = L.extend({}, L.CRS.Simple, {
    wrapLat:[0, -193],
    wrapLng:[0, 193]
  });
  
  var mapCenterLat = -115;
  var mapCenterLng = 127;
  var stopMap = L.map('map', {
    maxZoom: mapMaxZoom,
    minZoom: mapMinZoom,
    crs: L.CRS.MySimple,
    layers: [tiles2011],
    scrollWheelZoom: false
  }).setView([mapCenterLat, mapCenterLng], 0); //<--TODO: set initial zoom based on window size?
   
  var baseLayers = {
    "2003": tiles2003,
    "2004": tiles2004,
    "2005": tiles2005,
    "2006": tiles2006,
    "2007": tiles2007,
    "2008": tiles2008,
    "2009": tiles2009,
    "2010": tiles2010,
    "2011": tiles2011,
    "2012": tiles2012,
    "2013": tiles2013,
    "2014": tiles2014,
    "2015": tiles2015,
    "2016": tiles2016
  }

  L.control.layers(baseLayers).addTo(stopMap);

  // Toggle scroll wheel zoom on map
  stopMap.on('click', function() {
    stopMap.scrollWheelZoom.enabled() ? map.scrollWheelZoom.disable() : map.scrollWheelZoom.enable();
  }); 


  // Insert map legend
  //TODO: add open / close icon?
  var mapLegend = '<div id="mapLegend"><div><span class="dot" id="asianPacIslander">&#9679;</span>Asian||Pacific Islander</div><div><span id="black">&#9679;</span>Black</div><div><span id="amIndianAlaskan">&#9679;</span>American Indian||Alaskan</div><div><span id="blackHispanic">&#9679;</span>Black Hispanic</div><div><span id="whiteHispanic">&#9679;</span>White Hispanic</div><div><span id="white">&#9679;</span>White</div></div>';
  var bottomLeft = document.getElementsByClassName('leaflet-bottom leaflet-left')[0];
  bottomLeft.innerHTML = mapLegend;

  calcMapSpacer();

  console.log(stopMap.getBounds());
}

function initMap() {
  var startColor = 'E8D2BE';
  var endColor = '96D2BE';
  var textColor = '#3D4F39';
  var linkColor = '#4a617a';
  startMap();
  init(startColor, endColor);
};

$(window).resize(function() {
  calcMapSpacer();
});

function updateMapColor(newColor) {
  $('body').css('background-color', newColor);
  $('.projectContent').css('background-color', newColor);
  $('#map').css('background-color', newColor);
  $('.leaflet-control-layers-base label').css('background-color', newColor);
}

//------------------------------------------------------------------------------




//////////////////////
//// ALL PROJECTS ////
//////////////////////

var constantColor = '0000';
var startColor = '00';
var endColor = '00';
var titleMargin = 30;
function init(color1, color2) {
  constantColor = color1.slice(2, 6);
  startColor = color1.slice(0, 2);
  endColor = color2.slice(0, 2);
  console.log('s:' + startColor + ', e:' + endColor + ', c:' + constantColor);
}

function colorMap(start, end, percent) {
  var currentColor = ((end - start) / 100.0) * percent + start;
  return currentColor.toString(16).slice(0,2);
}

function updateColorDefault(newColor) {
  $('body').css('background-color', hexColor);
  $('.projectContent').css('background-color', hexColor);
}

$(window).on('scroll', function() {
  //TODO: set splash image margin based on height of project title?
  if (titleMargin > 0) {
    window.scrollTo(0, 0);
    titleMargin -= .5;
    $('.projectTitle').css('margin-top', titleMargin + '%');
  }

  var s = $(window).scrollTop();
  var d = $(document).height();
  var c = $(window).height();

  var scrollPercent = (s / (d - c)) * 100;
  var finalColor = colorMap(parseInt(startColor, 16), parseInt(endColor, 16), scrollPercent);
  var hexColor = '#' + finalColor + constantColor;

  updateMapColor(hexColor);
});
