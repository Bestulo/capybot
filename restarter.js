const express = require("express");
const app = express();
const port = 9876;
const { exec } = require("child_process");

app.get("/", (req, res) => {
  const restart = req.query.restart;

  if (restart === "true") {
    exec("pm2 restart capy --update-env", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        res.send("<p>Restart failed</p>");
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        res.send("<p>Restart failed</p>");
        return;
      }

      console.log(`stdout: ${stdout}`);
      res.send("<p>Restarted successfully</p>");
    });
  } else {
    res.send("<p>Invalid request</p>");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
