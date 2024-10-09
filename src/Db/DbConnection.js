import mongoose from "mongoose";
import app from "../app.js";
import logger from "../utils/logger.js";
const dbConnection = () => {
  mongoose.connect(process.env.DB_ATLAS);

  mongoose.connection.on("connected", () => {
    console.log(`Database Connection Successfully`);
    logger.info(`Database Connection Successfully`);
    app.listen(process.env.PORT, () =>
      console.log(`Server Listening on PORT ${process.env.PORT}`)
    );
    logger.info(`Server Listening on PORT ${process.env.PORT}`);
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`Error: ${err.message}`);
    console.log(`Error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info(`DB DisConnected`);
    console.log(`DB DisConnected`);
    process.exit();
  });
};

export default dbConnection;
