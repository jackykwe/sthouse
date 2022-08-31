import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import { axiosCreateElectricityReading } from "services/electricity_readings";

/**
 * Code courtesy of
 * https://www.youtube.com/watch?v=2okUvC2qBWk
 * https://www.youtube.com/watch?v=tF6L6IIo-yg
 */
const compressToURL = (image: File) => {
  const abstractImg = document.createElement("img");
  const abstractCanvas = document.createElement("canvas");
  const ctx = abstractCanvas.getContext("2d");

  if (ctx === null) {
    alert("FUCK");
    return "";
  }

  let result = "";
  abstractImg.src = URL.createObjectURL(image);
  abstractImg.onload = () => {
    abstractCanvas.width = abstractImg.width;
    abstractCanvas.height = abstractImg.height;
    ctx.drawImage(abstractImg, 0, 0);

    result = ctx.canvas.toDataURL("image/png", 1);
  };
  console.log("result is ", result);
  return result;
};

/**
 * Image preview courtesy of
 * https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa
 *
 * Image fitting to container courtesy of
 * https://stackoverflow.com/a/41775258
 */
export const ElectricityReadingCreatePage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  // useEffect(() => {
  //   if (imageFile !== null) console.log(URL.createObjectURL(imageFile));
  // }, [imageFile]);

  return (
    <>
      {imageFile !== null ? (
        <img
          src={compressToURL(imageFile)}
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
        <Button
          onClick={() => {
            axiosCreateElectricityReading(
              {
                low_kwh: 88,
                normal_kwh: 999.99,
                creator_name: "Hello",
                creator_email: "hi@example.com",
              },
              imageFile!
            );
          }}
        >
          SUBMIT
        </Button>
      </Box>
    </>
  );
};

export default ElectricityReadingCreatePage;
