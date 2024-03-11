import { Box, IconButton, List, ListItemButton, Typography } from '@mui/material';
import React from 'react';
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ListArea = ({layer, setActiveArea, setDeleteIdArea, handleOpenConfirmDelete, state = false}) => {
  
  return (
    <>
                          <List
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        bgcolor: "background.paper",
                      }}
                    >
                      {layer.map((item, index) => {
                        const svgString = item.properties.svg.replace(
                          'stroke-width="40"',
                          'stroke-width="30"'
                        );
                        return (
                          <ListItemButton
                            key={index}
                            style={{
                              width: "100%",
                              display: "flex",
                              gap: "5px",
                              // height: "100px",
                              padding: "0",
                              justifyContent: "space-between",
                              "&:hover": {
                                backgroundColor: "blue",
                                color: "white",
                                "& .MuiListItemIcon-root": {
                                  color: "white",
                                },
                              },
                            }}
                            onClick={() => {
                              setActiveArea(item);
                            }}
                          >
                            <svg
                              style={{
                                width: "100%",
                                maxWidth: "70px",
                                height: "70px",
                              }}
                              dangerouslySetInnerHTML={{ __html: svgString }}
                            />
                            <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                              <Typography variant="body2" sx={{fontWeight: 'bold', fontSize: '12px'}}>
                                {state ? item.properties.plot_сadastral_number : item.properties.crop}
                              </Typography>
                              <Typography noWrap maxWidth={140} variant="caption">
                              {state ? item.properties.plot_form_owner : item.properties.crop_kind}
                              </Typography>
                              <Typography noWrap maxWidth={140} variant="caption">
                              {state ? item.properties.plot_land_category : item.properties.name}
                              </Typography>
                            </Box>
                            <Typography variant="caption">
                              {item.properties.area} га
                            </Typography>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                // e.preventDefault()
                                setDeleteIdArea(item.properties.id);
                                handleOpenConfirmDelete();
                              }}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </ListItemButton>
                        );
                      })}
                    </List>
    </>
  );
};

export default ListArea;
