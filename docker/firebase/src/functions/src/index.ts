import * as functions from "firebase-functions";
import * as express from "express";
import {Request, Response, NextFunction} from "express";

/**
 * HttpException
 */
class HttpException extends Error {
  statusCode?: number;
  message: string;

  /**
   * constructor
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode || 500;
    this.message = message;
  }
}
const app: express.Express = express();
import helloWorld from "./routes/helloWorld";
import sendFcm from "./routes/sendFcm";

app.use(helloWorld);
app.use(sendFcm);

// Error Handling
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: "Route Not Found",
  });
});

app.use((e: HttpException, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: e.name + ": " + e.message,
  });
});

export const api = functions.https.onRequest(app);
