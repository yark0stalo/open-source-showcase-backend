const Pool = require("pg").Pool;
const pool = new Pool({
  user: "yark0",
  host: "localhost",
  database: "open_source_showcase",
  password: "",
  port: 5432,
});

const getProjects = async () => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT * FROM projects ORDER BY id ASC", (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
          resolve(results.rows);
        } else {
          reject(new Error("No results found"));
        }
      });
    });
  } catch (error_1) {
    console.log(error_1);
    throw new Error("Internal server error");
  }
};

const getProjectsNames = async () => {
  try {
    return await new Promise(function (resolve, reject) {
      pool.query("SELECT name FROM projects", (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
          resolve(results.rows);
        } else {
          reject(new Error("No results found"));
        }
      });
    });
  } catch (error_1) {
    console.log(error_1);
    throw new Error("Internal server error");
  }
};

const getProjectData = async (body) => {
  try {
    const { name } = body;
    return await new Promise(function (resolve, reject) {
      pool.query(
        "SELECT * FROM projects WHERE name = $1",
        [name],
        (error, results) => {
          if (error) {
            reject(error);
          }
          if (results && results.rows) {
            resolve(results.rows);
          } else {
            reject(new Error("No results found"));
          }
        }
      );
    });
  } catch (error_1) {
    console.log(error_1);
    throw new Error("Internal server error");
  }
};

const createProject = (data) => {
  return new Promise(function (resolve, reject) {
    const {
      name,
      description,
      logo,
      images,
      projectLink,
      githubLink,
      downloadLink,
    } = data;
    pool.query(
      "INSERT INTO projects (name, description, logo_path, images_paths, project_link, project_gh_link, project_load_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, description, logo, images, projectLink, githubLink, downloadLink],
      (error, results) => {
        if (error) {
          reject(error);
        }
        if (results && results.rows) {
          resolve(
            `A new project has been added: ${JSON.stringify(results.rows[0])}`
          );
        } else {
          reject(new Error("No results found"));
        }
      }
    );
  });
};

const deleteProject = (id) => {
  return new Promise(function (resolve, reject) {
    pool.query("DELETE FROM projects WHERE id = $1", [id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(`Project deleted with ID: ${id}`);
    });
  });
};

const updateProject = (id, body) => {
  return new Promise(function (resolve, reject) {
    const {
      name,
      description,
      logo,
      images,
      projectLink,
      githubLink,
      downloadLink,
    } = body;
    let dynamicQuery = "";
    let values = [];
    let counter = 1;
    for (const key in body) {
      if (key != "prevName") {
        dynamicQuery += `${key} = $${counter}, `;
        values.push(body[key]);
        counter++;
      }
    }
    values.push(id);
    let query = `UPDATE projects SET ${dynamicQuery.slice(
      0,
      dynamicQuery.length - 2
    )} WHERE id = $${counter} RETURNING *`;
    console.log(dynamicQuery);
    console.log(query);
    console.log(values);
    pool.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      }
      if (results && results.rows && results.rows.length > 0) {
        resolve(`Project updated: ${JSON.stringify(results.rows[0])}`);
      } else {
        reject(new Error("No results found"));
      }
    });
  });
};

module.exports = {
  getProjects,
  getProjectsNames,
  getProjectData,
  createProject,
  deleteProject,
  updateProject,
};
