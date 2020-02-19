import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { FieldProps } from "formik";

import { useDropzone } from "react-dropzone";
import useUploader from "hooks/useFiretable/useUploader";

import {
  makeStyles,
  createStyles,
  ButtonBase,
  Typography,
  Grid,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/AddAPhoto";
import DeleteIcon from "@material-ui/icons/Delete";

import ErrorMessage from "../ErrorMessage";
import Confirmation from "components/Confirmation";

const useStyles = makeStyles(theme =>
  createStyles({
    dropzoneButton: {
      backgroundColor:
        theme.palette.type === "light"
          ? "rgba(0, 0, 0, 0.09)"
          : "rgba(255, 255, 255, 0.09)",
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(0, 2),
      justifyContent: "flex-start",

      margin: 0,
      width: "100%",
      height: 56,

      color: theme.palette.text.secondary,

      "& svg": { marginRight: theme.spacing(2) },
    },

    imagesContainer: {
      marginTop: theme.spacing(1),
    },

    img: {
      position: "relative",

      width: 80,
      height: 80,
      borderRadius: theme.shape.borderRadius,
      boxShadow: `0 0 0 1px ${theme.palette.divider} inset`,

      backgroundSize: "contain",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
    },

    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,

      backgroundColor: "rgba(255, 255, 255, 0.8)",
      color: theme.palette.text.secondary,
      boxShadow: `0 0 0 1px ${theme.palette.divider} inset`,
      borderRadius: theme.shape.borderRadius,
    },

    deleteImgHover: {
      opacity: 0,
      transition: theme.transitions.create("opacity", {
        duration: theme.transitions.duration.shortest,
      }),
      "$img:hover &": { opacity: 1 },
    },
  })
);

export interface IImageUploaderProps extends FieldProps {
  docRef?: firebase.firestore.DocumentReference;
}

export default function ImageUploader({
  form,
  field,
  docRef,
}: IImageUploaderProps) {
  const classes = useStyles();

  const [uploaderState, upload] = useUploader();
  const { progress } = uploaderState;

  // Store a preview image locally while uploading
  const [localImage, setLocalImage] = useState<string>("");

  const onDrop = useCallback(
    acceptedFiles => {
      const imageFile = acceptedFiles[0];

      if (docRef && imageFile) {
        upload({
          docRef,
          fieldName: field.name,
          files: [imageFile],
          previousValue: field.value ?? [],
          onComplete: newValue => {
            form.setFieldValue(field.name, newValue);
            setLocalImage("");
          },
        });
        setLocalImage(URL.createObjectURL(imageFile));
      }
    },
    [docRef]
  );

  const handleDelete = (index: number) => {
    const newValue = [...field.value];
    newValue.splice(index, 1);
    form.setFieldValue(field.name, newValue);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/gif",
      "image/webp",
    ],
  });

  return (
    <>
      <ButtonBase className={classes.dropzoneButton} {...getRootProps()}>
        <input id={`sidemodal-field-${field.name}`} {...getInputProps()} />
        <AddIcon />
        <Typography variant="body1" color="textSecondary">
          Upload image
        </Typography>
      </ButtonBase>

      <Grid container spacing={1} className={classes.imagesContainer}>
        {Array.isArray(field.value) &&
          field.value.map((image, i) => (
            <Grid item key={image.downloadURL}>
              <Tooltip title="Click to delete">
                <span>
                  <Confirmation
                    message={{
                      title: "Delete Image",
                      body: "Are you sure you want to delete this image?",
                      confirm: "Delete",
                    }}
                  >
                    <ButtonBase
                      className={classes.img}
                      style={{ backgroundImage: `url(${image.downloadURL})` }}
                      onClick={() => handleDelete(i)}
                    >
                      <Grid
                        container
                        justify="center"
                        alignItems="center"
                        className={clsx(
                          classes.overlay,
                          classes.deleteImgHover
                        )}
                      >
                        <DeleteIcon color="inherit" />
                      </Grid>
                    </ButtonBase>
                  </Confirmation>
                </span>
              </Tooltip>
            </Grid>
          ))}

        {localImage && (
          <Grid item>
            <ButtonBase
              className={classes.img}
              style={{ backgroundImage: `url(${localImage})` }}
            >
              <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.overlay}
              >
                <CircularProgress
                  color="inherit"
                  size={48}
                  variant={progress === 0 ? "indeterminate" : "static"}
                  value={progress}
                />
              </Grid>
            </ButtonBase>
          </Grid>
        )}
      </Grid>

      <ErrorMessage name={field.name} />
    </>
  );
}
