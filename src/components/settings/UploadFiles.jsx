import React, {useRef} from 'react';
import {Button, Typography} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {httpService} from "../../api/setup";
import {enqueueSnackbar} from "notistack";
import {styled} from "@mui/material/styles";

export const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const UploadFiles= ({url}) => {
    const fileInputRef = useRef(null);

    const handleFileSelection = (event) => {
        const file = event.target.files[0];

        let formData = new FormData();
        formData.append("file", file);

        httpService
            .post(url, formData)
            .then((res) => {
                if (res.status === 202) {
                    enqueueSnackbar("Данные загружаются, скоро можно будет увидеть их на сайте", {
                        autoHideDuration: 1000,
                        variant: "success",
                    });
                } else if (res.status === 422) {
                    enqueueSnackbar("Некорректный файл", {
                        autoHideDuration: 1000,
                        variant: "error",
                    });
                } else {
                    enqueueSnackbar("Ошибка загрузки файлов", {
                        autoHideDuration: 1000,
                        variant: "error",
                    });
                }
            })
            .finally(() => {
                fileInputRef.current.value = null;
            });
    };

    return (
        <Button
            component="label"
            variant="contained"
            onChange={handleFileSelection}
        >
            <CloudUploadIcon />
            <Typography ml={2}>
                Загрузить кмл
            </Typography>

            <VisuallyHiddenInput accept={'.kml'} type="file" ref={fileInputRef} />
        </Button>
    );
};

export default UploadFiles;