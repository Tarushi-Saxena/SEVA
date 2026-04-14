import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isReady = false;

export default async function handler(req: any, res: any) {
  if (!isReady) {
    await registerRoutes(app);
    isReady = true;
  }
  return app(req, res);
}
