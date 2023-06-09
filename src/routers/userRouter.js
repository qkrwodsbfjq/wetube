import express from "express"
import { getEdit, postEdit, deleteUser, see, logout, startGithubLogin, finishGithubLogin } from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";


const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/delete", protectorMiddleware, deleteUser);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware,finishGithubLogin);
userRouter.get("/:id(\\d+)", see);


export default userRouter;