require("dotenv").config();
require("express-async-errors");
const cors = require("cors");
const express = require("express");
const app = express();

const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

// routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const subgredditRouter = require("./routes/subgreddit");
const postRouter = require("./routes/post");
const reportRouter = require("./routes/report");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Greddit DB API</h1>");
});

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", authenticateUser, userRouter);
app.use("/api/subgreddit", authenticateUser, subgredditRouter);
app.use("/api/post", authenticateUser, postRouter);
app.use("/api/report", authenticateUser, reportRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5005;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
