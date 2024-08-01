import React, { memo, useEffect, useState } from "react";
import {
  TileLayer,
  LayersControl,
  useMapEvents,
  GeoJSON,
  LayerGroup,
  Tooltip,
} from "react-leaflet";
import {
  Box,
  CircularProgress,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Layers = memo(({ layer, activeArea, setActiveArea, year }) => {
  const [open, setOpen] = useState(false);
  const [activeAreaToModal, setActiveAreaToModal] = useState(null);
  const handleOpen = (item) => {
    setOpen(true);
    setActiveAreaToModal(item);
  };
  const handleClose = () => {
    setOpen(false);
    setActiveAreaToModal(null);
  };

  const map = useMapEvents({
    // Use leaflet map event as the key and a call back with the
    // map method as the value:
    zoomend: () => {
      // Get the zoom level once zoom ended:
      // console.log(map.getZoom());
    },
    moveend: () => {
      // Get bounds once move has ended:
      // console.log(map.getBounds());
    },
    // click: (e) => {
    //   map.setView(e.latlng, map.getZoom(), {
    //     animate: true,
    //   })
    // },
  });

  useEffect(() => {
    if (layer && layer?.features?.length) {
      map.setView([layer.center[1], layer.center[0]], map.getZoom());
    }
  }, [layer]);

  useEffect(() => {
    if (activeArea) {
      map.fitBounds(
        activeArea.geometry.coordinates[0].map((item) => item.reverse())
      );
      activeArea.geometry.coordinates[0].map((item) => item.reverse());
      setActiveArea(null);
    }
  }, [activeArea]);

  const hashString = (str) => {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < Math.min(str.length, 255); i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  return (
    <>
      <LayersControl position="topleft">
        <LayersControl.BaseLayer name="Basic Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
            ext="png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Topo Map">
          <TileLayer
            attribution='Map data: &amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &amp;copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="WorldImagery">
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        {layer.features &&
          layer.features.map((item, key) => {
            return (
              <LayerGroup key={key}>
                <GeoJSON
                  key={item.properties.id}
                  data={item}
                  pathOptions={{ color: item.properties.color }}
                  eventHandlers={{
                    click: (event, type) => {
                      map.fitBounds(
                        item.geometry.coordinates[0].map((item) =>
                          item.reverse()
                        )
                      );
                      item.geometry.coordinates[0].map((item) =>
                        item.reverse()
                      );
                      handleOpen(item);
                    },
                  }}
                >
                  <Tooltip sticky>
                    <Typography>
                      {item.properties.crop.charAt(0).toUpperCase() +
                        item.properties.crop.slice(1)}
                    </Typography>
                    <Typography>{item.properties.area} га</Typography>
                  </Tooltip>
                </GeoJSON>
              </LayerGroup>
            );
          })}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} display={"flex"} justifyContent={"center"}>
            {activeAreaToModal ? (
              <Box display={"flex"} flexDirection={"column"} gap={2}>
                <Typography variant="h5" mb={2}>Паспорт поля</Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box display={"flex"} gap={2}>
                  <TextField
                    disabled
                    id="name-area"
                    label={"Название поля"}
                    defaultValue={activeAreaToModal.properties.name}
                    variant="outlined"
                  />
                  <TextField
                    disabled
                    id="year-area"
                    defaultValue={year}
                    label={"Год"}
                    variant="outlined"
                  />
                </Box>
                <TextField
                  disabled
                  id="crop-area"
                  label={"Культура"}
                  defaultValue={activeAreaToModal.properties.crop}
                  variant="outlined"
                />
                <TextField
                  disabled
                  id="crop-kind-area"
                  label={"Сорт"}
                  defaultValue={activeAreaToModal.properties.crop_kind}
                  variant="outlined"
                />
                <TextField
                  disabled
                  id="crop-group-area"
                  label={"Группа с/х культур"}
                  defaultValue={activeAreaToModal.properties.crop_group}
                  variant="outlined"
                />
                <TextField
                  disabled
                  id="area-area"
                  label={"Площадь, га"}
                  defaultValue={activeAreaToModal.properties.area}
                  variant="outlined"
                />
              </Box>
            ) : (
              <CircularProgress color="success" />
            )}
          </Box>
        </Modal>
      </LayersControl>
    </>
  );
});
export default Layers;
