import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config();

// For local development
if (process.env.NODE_ENV !== 'production') {
  connectDB()
    .then(() => {
      const port = process.env.PORT || 8000;
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.log("Failed to connect to the database:", error.message);
      process.exit(1);
    });
}

// For Vercel serverless deployment
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}


