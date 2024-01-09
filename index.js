const express = require("express");
const http = require("http");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 3001;

const projectModel = require("./models/projectModel");
const contentPath = "./content/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("storage: ");
    console.log(req.files);
    const projectDirectory = `${contentPath}${
      req.body.name || req.body.prevName
    }`;
    console.log(projectDirectory);
    const logoPath = path.join(projectDirectory, "logo");
    const imagesPath = path.join(projectDirectory, "images");

    // Создание директорий, если они не существуют
    fs.mkdirSync(projectDirectory, { recursive: true });
    fs.mkdirSync(logoPath, { recursive: true });
    fs.mkdirSync(imagesPath, { recursive: true });

    if (file.fieldname == "logo" || file.fieldname == "logo_path") {
      cb(null, logoPath);
    } else if (file.fieldname == "images" || file.fieldname == "images_paths") {
      cb(null, imagesPath);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers"
  );
  next();
});
app.use("/content", express.static(contentPath));

app.get("/", (req, res) => {
  projectModel
    .getProjects()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.get("/projects", (req, res) => {
  projectModel
    .getProjectsNames()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.get("/projects/:name", (req, res) => {
  projectModel
    .getProjectData(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post(
  "/projects",
  upload.fields([
    { name: "name", maxCount: 1 },
    { name: "description", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 3 },
    { name: "projectLink", maxCount: 1 },
    { name: "githubLink", maxCount: 1 },
    { name: "downloadLink", maxCount: 1 },
  ]),
  (req, res) => {
    let imagesPath = [];
    for (let i = 0; i < req.files.images.length; i++) {
      imagesPath.push(req.files.images[i].path);
    }
    const data = {
      name: req.body.name,
      description: req.body.description,
      logo: req.files.logo[0].path,
      images: imagesPath,
      projectLink: req.body.projectLink,
      githubLink: req.body.githubLink,
      downloadLink: req.body.downloadLink,
    };
    projectModel
      .createProject(data)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

app.delete("/projects/:id", (req, res) => {
  projectModel
    .deleteProject(req.params.id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.put(
  "/projects/:id",
  upload.fields([
    { name: "logo_path", maxCount: 1 },
    { name: "images_paths", maxCount: 3 },
  ]),
  (req, res) => {
    const id = req.params.id;
    const body = req.body;
    let images_paths = [];
    console.log(req.files);
    if (req.files.images_paths) {
      for (let i = 0; i < req.files.images_paths.length; i++) {
        images_paths.push(req.files.images_paths[i].path);
      }
    }
    if (req.files.logo_path) {
      body["logo_path"] = req.files.logo_path[0].path;
    }
    console.log(images_paths);
    if (images_paths.length > 0) {
      body["images_paths"] = images_paths;
    }
    console.log("update data:");
    console.log(body);
    projectModel
      .updateProject(id, body)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  }
);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
