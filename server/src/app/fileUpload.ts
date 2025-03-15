import express, { Request, Response } from "express";
import { fileUpload } from "../utils/middleware/mutler";
import { uploadOnCloudinary } from "../services/cloudinary";

const fileUploadRouter = express.Router();
const previewImages = async (req: any, res: Response) => {
  console.log(req.files, "req");
  const files = req.files;

  if (files.length == 0) {
    throw new Error("please provide the images");
  }
  const fileUrl = await uploadOnCloudinary(files);

  return res.status(200).json({
    messages: "successfully uploaded the file.",
    fileUrl,
  });
};

fileUploadRouter.post(
  "/previewImages",
  fileUpload.array("files"),
  previewImages
);

export default fileUploadRouter;
