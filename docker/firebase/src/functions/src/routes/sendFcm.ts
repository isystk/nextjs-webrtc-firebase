import * as functions from "firebase-functions";
import {Request, Response, NextFunction} from "express";
import router from "./common";

import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

router.post("/sendFcm", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = req.body;
    if (!text) {
      throw new Error("Text is blank");
    }

    const {title, description, thumbnailUrl, path} = req;

    const tokens = ['<token>']
    const content: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body: description,
        imageUrl: thumbnailUrl
      },
      data: {
        pathname: path
      },
      tokens
    }

    await admin.messaging().sendMulticast(content)

    res.json({
      content,
    });

  } catch (e) {
    next(e);
  }
});

export default router;

