import * as functions from "firebase-functions";
import {Request, Response, NextFunction} from "express";
import router from "./common";

/* eslint max-len: 1 */
router.get("/helloWorld", function(req: Request, res:Response, next: NextFunction) {
  functions.logger.info("Hello logs!", {structuredData: true});
  res.send("Hello from Firebase!");
});

export default router;
