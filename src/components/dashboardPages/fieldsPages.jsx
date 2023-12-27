import { Box } from "@mui/material";
import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

const FieldsPages = () => {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    width: '100%'
  }));

  return (
    <Box sx={{ height: '100%' }}>

      <Grid spacing={2} sx={{ marginBottom: "20px" }} container xs={12}>
        <Grid item xs={12}>
          <Item>xs=12 Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe nesciunt natus ex quasi id atque animi, officia corporis provident quae maiores, fugit beatae adipisci, quod iure at sint? Omnis, consequuntur? Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aperiam vero architecto perspiciatis? Porro incidunt unde odio odit est atque aut modi, iure assumenda nisi perspiciatis in quis a, fugiat id. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio, est officia laborum aliquid veritatis voluptas error optio ab hic magnam. Aliquid voluptatibus eos eaque culpa blanditiis harum tempore praesentium nihil. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus, officia repellat! Velit fugiat reprehenderit assumenda quibusdam illum! Necessitatibus numquam nostrum, ipsam eius architecto, illum itaque cum, eos quos sunt aperiam?</Item>
        </Grid>
      </Grid>

      <Grid xs={12} container alignItems="stretch" spacing={2} sx={{ height: 'calc(100% - 118px)' }}>

        <Grid sx={{ width: "100%" }} item xs={4} display="flex">
          <Item>xs=1221321</Item>
        </Grid>
        

        <Grid item xs={6} display="flex">
          <Grid rowSpacing={2} container xs={12} alignItems="stretch">
            <Grid item xs={12} display="flex">
              <Item>xs=12</Item>
            </Grid>
            <Grid item xs={12} display="flex">
              <Item>xs=12</Item>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={2} display="flex">
        <Grid rowSpacing={2} container xs={12} alignItems="stretch">
            <Grid item xs={12} display="flex">
              <Item>xs=12</Item>
            </Grid>
            <Grid item xs={12} display="flex">
              <Item>xs=12</Item>
            </Grid>
          </Grid>
        </Grid>

      </Grid>

    </Box>
  );
};

export default FieldsPages;
