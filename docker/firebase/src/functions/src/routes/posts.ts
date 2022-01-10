import * as functions from "firebase-functions";
import {Request, Response, NextFunction} from "express";
import router from "./common";
import * as moment from "moment";

import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import QuerySnapshot = firestore.QuerySnapshot;
import DocumentData = firestore.DocumentData;
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

type Data = {
  id: string,
  data: DocumentData
}

/* eslint max-len: 1 */
// Read All
router.get("/posts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query = db.collection("posts").orderBy("regist_datetime", "desc");
    const {userId, limit = 10, last} = req.query;
    if (userId) {
      query = query.where("user_id", "==", userId);
    }

    if (last) {
      query = query.startAfter(last);
    }

    const itemSnapshot: QuerySnapshot<DocumentData> = await query
        .limit(parseInt(limit+""))
        .get();
    const posts = [] as Data[];
    itemSnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    res.json(posts);
  } catch (e) {
    next(e);
  }
});

// Read
router.get("/posts/:id/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error("id is blank");
    }
    const post = await db
        .collection("posts")
        .doc(id)
        .get();
    if (!post.exists) {
      throw new Error("post does not exists");
    }
    res.json({
      id: post.id,
      data: post.data(),
    });
  } catch (e) {
    next(e);
  }
});

// Create
router.post("/posts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = req.body;
    if (!text) {
      throw new Error("Text is blank");
    }
    const data = {...text, regist_datetime: moment().format(), update_datetime: moment().format()};
    const ref = await db.collection("posts").add(data);
    res.json({
      id: ref.id,
      data,
    });
  } catch (e) {
    next(e);
  }
});

// Update
router.put("/posts/:id", async (req: Request, res: Response, next:NextFunction) => {
  try {
    const id = req.params.id;
    const text = req.body;

    if (!id) {
      throw new Error("id is blank");
    }
    const post = await db
        .collection("posts")
        .doc(id)
        .get();
    if (!post.exists) {
      throw new Error("post does not exists");
    }

    const data = {...post.data, ...text, update_datetime: moment().format()};
    await db
        .collection("posts")
        .doc(id)
        .update({
          ...data,
        });
    res.json({
      id,
      data,
    });
  } catch (e) {
    next(e);
  }
});

// Delete
router.delete("/posts/:id", async (req:Request, res: Response, next:NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error("id is blank");
    }
    await db
        .collection("posts")
        .doc(id)
        .delete();
    res.json({
      id,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

