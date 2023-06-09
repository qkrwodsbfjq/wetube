import express from "express"
import { watch, getEdit, deleteVideo, getUpload, postEdit, postUpload } from "../controllers/videoController";
import { protectorMiddleware } from "../middlewares";


const videoRouter = express.Router();


videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(postUpload);
videoRouter.get("/:id([0-9a-f]{24})/delete", protectorMiddleware, deleteVideo);


export default videoRouter;