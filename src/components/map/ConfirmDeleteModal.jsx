import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import React from 'react';

const ConfirmDeleteModal = ({openConfirmDelete, handleCloseConfirmDelete, deletArea, deleteIdArea}) => {
  console.log(deleteIdArea);
  
  return (
    <Dialog
        open={openConfirmDelete}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Вы уверены что хотите удалить"} {Array.isArray(deleteIdArea) ? 'эти поля?' : 'это поле?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {Array.isArray(deleteIdArea) ? 'Выбранные поля удалятся' : 'Поле удалится'}  безвозвратно, вы уверены что хотите это сделать?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCloseConfirmDelete}
          >
            Отмена
          </Button>
          <Button variant="contained" onClick={deletArea} autoFocus>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ConfirmDeleteModal;
