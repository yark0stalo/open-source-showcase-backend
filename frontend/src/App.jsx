import { useState, useEffect } from "react";

function App() {
  const [projects, setProjects] = useState(false);

  function getProjects() {
    fetch("http://localhost:3001")
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        setProjects(data);
      });
  }

  function createProject() {
    let name = prompt("Enter project name");
    let description = prompt("Enter project description");
    fetch("http://localhost:3001/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    })
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        console.log("shit");
        console.log(result);
        alert(result);
        getProjects();
      });
  }

  function deleteProject() {
    let id = prompt("Enter project id");
    fetch(`http://localhost:3001/projects/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        alert(data);
        getProjects();
      });
  }

  function updateProject() {
    let id = prompt("Enter project id");
    let name = prompt("Enter new project name");
    let description = prompt("Enter new project description");
    fetch(`http://localhost:3001/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        alert(data);
        getProjects();
      });
  }

  useEffect(() => {
    getProjects();
  }, []);
  return (
    <div>
      {projects ? projects : "There is no project data available"}
      <br />
      <button onClick={createProject}>Add project</button>
      <br />
      <button onClick={deleteProject}>Delete project</button>
      <br />
      <button onClick={updateProject}>Update project</button>
    </div>
  );
}
export default App;
