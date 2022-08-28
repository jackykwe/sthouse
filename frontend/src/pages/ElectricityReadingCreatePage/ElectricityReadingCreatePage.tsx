import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

/**
 * Image preview courtesy of
 * https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa
 *
 * Image fitting to container courtesy of
 * https://stackoverflow.com/a/41775258
 */
export const ElectricityReadingCreatePage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  useEffect(() => {
    if (imageFile !== null) console.log(URL.createObjectURL(imageFile));
  }, [imageFile]);

  return (
    <>
      {imageFile !== null ? (
        <img
          src={URL.createObjectURL(imageFile)}
          alt="Preview of electricty reading"
          style={{
            minHeight: 0,
            width: "fit-content",
            objectFit: "scale-down",
          }}
        />
      ) : null}
      <Box sx={{ display: "flex" }}>
        <Button endIcon={<PhotoCameraIcon />} component="label">
          Select Photo
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={(event) =>
              setImageFile(event.target.files?.item(0) ?? null)
            }
          />
        </Button>
        <span>2</span>
        <span>3</span>
      </Box>
    </>
  );
};

export default ElectricityReadingCreatePage;
