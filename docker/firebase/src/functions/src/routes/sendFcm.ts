import {Request, Response, NextFunction} from "express";
import router from "./common";

import * as admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault()
})

router.post("/sendFcm", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {token, message} = req.body;
    if (!token) {
      throw new Error("Text is blank");
    }

    const tokens = [token]
    const content: admin.messaging.MulticastMessage = {
      notification: {
        title: message.title,
        body: message.description,
        // imageUrl: message.thumbnailUrl
      },
      data: {
        pathname: message.path
      },
      tokens
    }
    console.log(content)

    await admin.messaging().sendMulticast(content)

    res.json({
      content,
    });

  } catch (e) {
    next(e);
  }
});

export default router;

