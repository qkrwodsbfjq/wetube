import express from "express"
import {getJoin, postJoin, getLogin, postLogin, logout} from "../controllers/userController"
import {home, search} from "../controllers/videoController"
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";


const rootRouter = express.Router();

const handleHome = (req, res) => res.send("Home");

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/search", search)

export default rootRouter;