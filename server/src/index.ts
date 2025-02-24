import { initServer } from "./app";
import { PORT } from "./utils/constants";

async function init() {
  const { app } = await initServer();

  app.listen(PORT, () => {
    console.log("server is listening on port", PORT, "......");
  });
}

init();
