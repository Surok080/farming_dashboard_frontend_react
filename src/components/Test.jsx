import React from 'react';
import { MapContainer, TileLayer, Marker,Popup } from "react-leaflet";
import ReactLeafletKml from "react-leaflet-kml";
import kmlTest from './test.kml'

const Test = () => {
  const [kml, setKml] = React.useState(null);
  // const [routeDiagram,setRouteDiagram] = React.useState([[-37.97422419,144.54862721],[-37.98528799,144.56187422],[-38.00446143,144.59337727],[-37.92373806,144.79678225],[-37.86632046,144.75981066],[-37.8006,144.65647],[-37.78115,144.47781],[-37.89914516,144.4812785],[-37.92124576,144.48100243],[-37.96104478,144.48972215]]);
  const [routeDiagram,setRouteDiagram] = React.useState([]);
  

  React.useEffect(() => {
    fetch(
      // "https://raw.githubusercontent.com/aviklai/react-leaflet-kml/master/src/assets/example1.kml"
      "https://raw.githubusercontent.com/prasathyadhav/leaflet_kml/main/route.kml"
    )
      .then((res) => res.text())
      .then((kmlText) => {
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlText, "text/xml");
        var latLongArray = kml.querySelector( 'LineString' ).querySelector("coordinates").textContent.split(" ")
        var newArr = latLongArray.filter((_,i) => i % (latLongArray.length/10) == 0); 
        console.log(newArr,latLongArray.length);
        var setArr = [];
        newArr.forEach((elem)=>{
            let strArr = elem.split(",").splice(0,2).reverse();
            let numArr = [];
            strArr.forEach((elem)=>{
              numArr.push(parseFloat(elem));
            })
            console.log(numArr)
            setArr.push(numArr);
        })
        console.log(setArr);
        setRouteDiagram(setArr);
        setKml(kml);
      });
  }, []);

  return (
    <>
      <MapContainer
        style={{ height: "500px", width: "100%" }}
        zoom={10}
        center={[-37.974253,144.54865062]}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {kml && <ReactLeafletKml kml={kml} />}
        {routeDiagram.length > 0 && routeDiagram.map((position, idx) => 
          <Marker key={`marker-${idx}`} position={position}>
            <Popup>
              <span>{"User"}</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
};

export default Test;
