const API_URL = 'https://failteireland.azure-api.net/opendata-api/v1/attractions';
const CSV_PATH = 'assets/data/attractions.json'

// Initialize and add the map, code copied from Maps API documentation
let map;
let data;
let activeInfoWindow = false;
let linkIcon;

// CHECKS IS USER IS FIRST TIME VISITOR
const checkIfVisited = () => {

  if (window.localStorage.getItem('visited') === null) {
    console.log("you haven't visited before!");
    window.localStorage.setItem('visited', 'true')
    showFirstTimeVisitModal();
  }

}

// FUNCTION TO SHOW FIRST TIME VISIT MODAL
const showFirstTimeVisitModal = () => {

  const modalWindow = document.querySelector('.first-visit-modal');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalContainer = document.querySelector('.modal-container');
  modalWindow.classList.add('modal-visible');
  modalOverlay.classList.add('modal-overlay-visible');
  modalContainer.classList.add('modal-container-visible');
}

async function initMap() {
  // The location of Ireland
  const position = { lat: 53.4152431, lng: -7.9559668 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    mapId: "47f8f1437cc57452",
    zoom: 7,
    center: position,
  });

}

// function to fetch attraction data from Failte Ireland *** CSV ***
async function fetchData() {
  const getData = await fetch(CSV_PATH);
  data = await getData.json();
  // data = responseData.results;
  console.log(data);
  return data;
}

// function to intialise and plot ALL markers on page load
const initMarkers = async () => {
  await fetchData();
  for (let i = 0; i < data.length; i++) {
    //destructure each array obj to define lat lng arguments
    const { Latitude: lat,
      Longitude: lng,
      Name,
      AddressLocality,
      AddressRegion,
      Tags,
      Url,
      Telephone
    } = data[i];
    // console.log(lat, lng);
    if (AddressLocality.length === 0) {
      markerAddress = `${AddressRegion}`
    } else markerAddress = `${AddressLocality}, ${AddressRegion}`;

    let markerIcon;
    // define custom icons 
    // TODO set correct tag criteria for icon types
    if (Tags.includes('Castle')) markerIcon = 'assets/img/map-icons/icon-castle.png'
    else if (Tags.includes('Museum')) markerIcon = 'assets/img/map-icons/icon-museum.png'
    else if (Tags.includes('Natural Landscape') || Tags.includes('Nature') || Tags.includes('Garden') || Tags.includes('Forest')) markerIcon = 'assets/img/map-icons/icon-hiking.png'
    else if (Tags.includes('Food') || Tags.includes('Cafe')) markerIcon = 'assets/img/map-icons/icon-restaurant.png'
    else if (Tags.includes('Church')) markerIcon = 'assets/img/map-icons/icon-church.png'
    else if (Tags.includes('Public Sculpture') || Tags.includes('Art Gallery')) markerIcon = 'assets/img/map-icons/icon-art.png'
    else if (Tags.includes('Craft') || Tags.includes('Shopping')) markerIcon = 'assets/img/map-icons/icon-shopping.png'
    else if (Tags.includes('Beach') || Tags.includes('River')) markerIcon = 'assets/img/map-icons/icon-water.png'
    else if (Tags.includes('Gaa') || Tags.includes('Sports') || Tags.includes('Stadium')) markerIcon = 'assets/img/map-icons/icon-sport.png'
    else if (Tags.includes('Embarkation Point') || Tags.includes('Island')) markerIcon = 'assets/img/map-icons/icon-boat.png'
    else if (Tags.includes('Literary') || Tags.includes('Library') || Tags.includes('Learning')) markerIcon = 'assets/img/map-icons/icon-book.png'
    else if (Tags.includes('Zoos') || Tags.includes('Aquarium') || Tags.includes('Farm')) markerIcon = 'assets/img/map-icons/icon-zoo.png'
    else if (Tags.includes('Cycling') || Tags.includes('Cycle')) markerIcon = 'assets/img/map-icons/icon-cycling.png'

    const markerPos = { lat, lng }
    // console.log(Tags)

    // add current iteration of markerPos to array
    // markerArray.push(markerPos)
    //call function to plot markers on map
    const { Marker } = await google.maps.importLibrary("marker");
    const marker = new Marker({
      map: map,
      position: { lat: lat, lng: lng },
      title: Name,
      icon: markerIcon
    }
    )
    const directionsURL = `"https://www.google.com/maps?saddr=My+Location&daddr=${Name}, ${markerAddress}"`;
    // add infowindow to markers
    const infowindow = new google.maps.InfoWindow({
      content: `<div class = "info-window-content-container"><h4>${Name}</h4>
      ${markerAddress}
      <div class = "attraction-info-button-container">
        <a class = "attraction-info-button fa-solid fa-link" href = ${Url} target="_blank"></a>
        <a class = "attraction-info-button fa-solid fa-phone" href = tel:+${Telephone}></i></a>
        <a class = "attraction-info-button fa-solid fa-compass fa-lg" href = ${directionsURL} target="_blank"></a>
      </div></div>`,
      ariaLabel: `${Name}`,
    });

    marker.addListener("click", () => {
      // close active info window if new info window opened
      if (activeInfoWindow) {
        activeInfoWindow.close()
      };

      activeInfoWindow = infowindow;

      infowindow.open({
        anchor: marker,
        map,
      });
    });
    attractionListInfo = document.createElement('div');
    attractionListInfo.setAttribute('class', 'attractionListInfoDiv')
    attractionListInfo.innerHTML = `<h4>${Name}</h4>
    ${markerAddress}
    <div class = "attraction-info-button-container">
      <a class = "attraction-info-button fa-solid fa-link" href = ${Url} target="_blank"></a>
      <a class = "attraction-info-button fa-solid fa-phone" href = tel:+${Telephone}></a>
      <a class = "attraction-info-button fa-solid fa-compass fa-lg" href = ${directionsURL} target="_blank"></a>
    </div>`;
    searchContainer.append(attractionListInfo)

    markers.push(marker)

    // CHECK IF URL IS VALID, IF NOT MAKE ICONS UNUSABLE
    if (Url.length === 0) {
      linkIcon = document.querySelectorAll('.fa-link');
      linkIcon[i].classList.add('grey')
      linkIcon[i].removeAttribute('href', 'target');
    }
    // CHECK IF TELEPHONE IS VALID, IF NOT MAKE ICONS UNUSABLE
    if (Telephone.length === 0) {
      linkIcon = document.querySelectorAll('.fa-phone');
      linkIcon[i].classList.add('grey')
      linkIcon[i].removeAttribute('href');
    }
  }
}

const markers = [];
const searchContainer = document.querySelector('#search-container-results');
let attractionListInfo;

// Function loops through all data points and get lat lng arguments for createMarker function
const positionMarker = async (searchQuery) => {
  // await fetchData(); // ********* FOR TESTING PURPOSES **********
  // initMap()
  // define markerArray to use for marker clusterer
  // const markerArray = [];
  for (marker of markers) {
    marker.setMap(null);
  }
  markers.length = 0;

  let clearAttractionsList = document.querySelectorAll('.attractionListInfoDiv')
  if (clearAttractionsList) {
    for (attractions of clearAttractionsList) {
      attractions.remove();
    }
  }

  for (let i = 0; i < data.length; i++) {
    //destructure each array obj to define lat lng arguments
    const { Latitude: lat,
      Longitude: lng,
      Name,
      AddressLocality,
      AddressRegion,
      Tags,
      Url,
      Telephone
    } = data[i];
    // console.log(lat, lng);
    
    if (AddressLocality.length === 0) {
      markerAddress = `${AddressRegion}`
    } else markerAddress = `${AddressLocality}, ${AddressRegion}`;



    let markerIcon;
    // define custom icons 
    if (Tags.includes('Castle')) markerIcon = 'assets/img/map-icons/icon-castle.png'
    // else if (Tags.includes('Museum')) markerIcon = 'assets/img/map-icons/icon-museum.png'
    else if (Tags.includes('Natural Landscape') || Tags.includes('Nature') || Tags.includes('Garden') || Tags.includes('Forest')) markerIcon = 'assets/img/map-icons/icon-hiking.png'
    else if (Tags.includes('Food') || Tags.includes('Cafe')) markerIcon = 'assets/img/map-icons/icon-restaurant.png'
    else if (Tags.includes('Church')) markerIcon = 'assets/img/map-icons/icon-church.png'
    else if (Tags.includes('Public Sculpture') || Tags.includes('Art Gallery')) markerIcon = 'assets/img/map-icons/icon-art.png'
    else if (Tags.includes('Craft') || Tags.includes('Shopping')) markerIcon = 'assets/img/map-icons/icon-shopping.png'
    else if (Tags.includes('Beach') || Tags.includes('River')) markerIcon = 'assets/img/map-icons/icon-water.png'
    else if (Tags.includes('Gaa') || Tags.includes('Sports') || Tags.includes('Stadium')) markerIcon = 'assets/img/map-icons/icon-sport.png'
    else if (Tags.includes('Embarkation Point') || Tags.includes('Island')) markerIcon = 'assets/img/map-icons/icon-boat.png'
    else if (Tags.includes('Literary') || Tags.includes('Library') || Tags.includes('Learning')) markerIcon = 'assets/img/map-icons/icon-book.png'
    else if (Tags.includes('Zoos') || Tags.includes('Aquarium') || Tags.includes('Farm')) markerIcon = 'assets/img/map-icons/icon-zoo.png'
    else if (Tags.includes('Cycling') || Tags.includes('Cycle')) markerIcon = 'assets/img/map-icons/icon-cycling.png'

    if (searchQuery === undefined || searchQuery === null) {
      const markerPos = { lat, lng }
      // console.log(Tags)

      // add current iteration of markerPos to array
      // markerArray.push(markerPos)
      //call function to plot markers on map
      const { Marker } = await google.maps.importLibrary("marker");
      const marker = new Marker({
        // map: map,
        position: { lat: lat, lng: lng },
        title: Name,
        icon: markerIcon
      }
      )
      const directionsURL = `"https://www.google.com/maps?saddr=My+Location&daddr=${Name}, ${markerAddress}"`;
      // add infowindow to markers
      const infowindow = new google.maps.InfoWindow({
        content: `<div class = "info-window-content-container"><h4>${Name}</h4>
        ${markerAddress}
        <div class = "attraction-info-button-container">
          <a class = "attraction-info-button fa-solid fa-link" href = ${Url} target="_blank"></a>
          <a class = "attraction-info-button fa-solid fa-phone" href = tel:+${Telephone}></i></a>
          <a class = "attraction-info-button fa-solid fa-compass fa-lg" href = ${directionsURL} target="_blank"></a>
        </div></div>`,
        ariaLabel: `${Name}`,
      });

      marker.addListener("click", () => {
        // close active info window if new info window opened
        if (activeInfoWindow) {
          activeInfoWindow.close()
        };

        activeInfoWindow = infowindow;

        infowindow.open({
          anchor: marker,
          map,
        });
      });

      markers.push(marker)

    }


    else if (Tags.toLowerCase().includes(searchQuery) || Name.toLowerCase().includes(searchQuery) || markerAddress.toLowerCase().includes(searchQuery)) {
      // create marker position object for array
      const markerPos = { lat, lng }
      // console.log(Tags)

      // add current iteration of markerPos to array
      // markerArray.push(markerPos)
      //call function to plot markers on map
      const { Marker } = await google.maps.importLibrary("marker");
      const marker = new Marker({
        // map: map,
        position: { lat: lat, lng: lng },
        title: Name,
        icon: markerIcon
      }
      )
      const directionsURL = `"https://www.google.com/maps?saddr=My+Location&daddr=${Name}, ${markerAddress}"`;
      // add infowindow to markers
      const infowindow = new google.maps.InfoWindow({
        content: `<div class = "info-window-content-container"><h4>${Name}</h4>
        ${markerAddress}
        <div class = "attraction-info-button-container">
          <a class = "attraction-info-button fa-solid fa-link" href = ${Url} target="_blank"></a>
          <a class = "attraction-info-button fa-solid fa-phone" href = tel:+${Telephone}></i></a>
          <a class = "attraction-info-button fa-solid fa-compass fa-lg" href = ${directionsURL} target="_blank"></a>
        </div></div>`,
        ariaLabel: `${Name}`,
      });

      marker.addListener("click", () => {
        // close active info window if new info window opened
        if (activeInfoWindow) {
          activeInfoWindow.close()
        };

        activeInfoWindow = infowindow;

        infowindow.open({
          anchor: marker,
          map,
        });
      });
      attractionListInfo = document.createElement('div');
      attractionListInfo.setAttribute('class', 'attractionListInfoDiv')
      attractionListInfo.innerHTML = `<h4>${Name}</h4>
      ${markerAddress}
      <div class = "attraction-info-button-container">
      <a class = "attraction-info-button fa-solid fa-link" href = ${Url} target="_blank"></a>
      <a class = "attraction-info-button fa-solid fa-phone" href = tel:+${Telephone}></i></a>
      <a class = "attraction-info-button fa-solid fa-compass fa-lg" href = ${directionsURL} target="_blank"></a>
    </div>`,
        searchContainer.append(attractionListInfo)
      markers.push(marker)

      // console.log(markers)
    }
  }
  //DONT DELETE, MARKER CLUSTERING
  // const markerCluster = new markerClusterer.MarkerClusterer({ map, markers });


  for (marker of markers) {
    marker.setMap(map);
  }
}

let searchQuery;
const searchBar = document.querySelector('#search');

const performSearch = (callback) => {
  searchBar.addEventListener('input', function () {
    searchQuery = searchBar.value.toLowerCase();
    console.log(searchQuery);
    callback(searchQuery);
  })
}

// main function to run app
const main = async () => {
  checkIfVisited();
  initMap();
  initMarkers();
  await fetchData();
  performSearch((searchQuery) => positionMarker(searchQuery));
}

// FUNCTION TO RUN WHEN CHEVRON CLICKED
const openDrawer = () => {
  const searchBar = document.querySelector('#search');
  const searchContainer = document.querySelector('#search-container');
  const searchContainerHeadChevron = document.querySelector('#drawer-chevron');
  const searchContainerResults = document.querySelector('#search-container-results');
  searchBar.classList.toggle('search-open')
  searchContainer.classList.toggle('search-container-open')
  searchContainerHeadChevron.classList.toggle('drawer-chevron-open')
  searchContainerResults.classList.toggle('search-container-results-open')

}
// LISTEN FOR CLICK ON CHEVRON, THEN RUN ABOVE FUNCTION TO OPEN DRAWER
const searchContainerOpener = document.querySelector('#drawer-chevron-container');
searchContainerOpener.addEventListener('click', openDrawer);

main();






// const searchInput = (query) => {
//   const searchBar = document.querySelector('#search')
//   const newevent = searchBar.addEventListener('search', function(event){
//     console.log(event.type);
//     console.log(event.value);
//   } );
//   console.log(query);
// }

// searchInput()

// const testFunction = async () => {
//     const fetchJson = await fetch('/assets/js/csvjson.json')
//     const responseJson = await fetchJson.json();
//     console.log(responseJson);

// }

// testFunction()

// function takes lat lng parameters which are defined in positionMarker function, code copied from Maps API documentation and modified
// const createMarker = async (lat, lng) => {
//     const { Marker } = await google.maps.importLibrary("marker");
//     const marker = new Marker({
//       map: map,
//       position: { lat: lat, lng: lng },
//     });
//   }

//   COMMENTED OUT, FETCHING CSV AS API IS PAGINATED, NEW FUNCTION BELOW
// function to fetch attraction data from Failte Ireland API
// async function fetchData() {
//     const getData = await fetch(API_URL);
//     const responseData = await getData.json();
//     data = responseData.results;
//     console.log(data);
//     return data;
// }


//TODO
// add site elements and styling
// add marker popups with info 
// add search
// add filters
// add marker clusters

