const projectsList = document.querySelector("#projects-list");

const isSafeProjectUrl = (value) => {
  try {
    const url = new URL(value, document.baseURI);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const createProjectCard = (project, index) => {
  const listItem = document.createElement("li");
  const article = document.createElement("article");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const metadata = document.createElement("ul");
  const projectTitle = typeof project.title === "string" ? project.title : "Project";
  const headingId = `project-${index + 1}-heading`;

  article.className = "project-card";
  article.setAttribute("aria-labelledby", headingId);
  title.id = headingId;
  title.textContent = projectTitle;
  description.textContent =
    typeof project.description === "string" ? project.description : "";
  metadata.className = "project-card__meta";
  metadata.setAttribute("aria-label", "Technologies used");

  if (Array.isArray(project.technologies)) {
    project.technologies.forEach((technology) => {
      if (typeof technology !== "string") {
        return;
      }

      const badge = document.createElement("li");

      badge.className = "project-card__badge";
      badge.textContent = technology;
      metadata.append(badge);
    });
  }

  article.append(title, description, metadata);

  if (isSafeProjectUrl(project.url)) {
    const link = document.createElement("a");

    link.className = "project-card__link";
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent =
      typeof project.linkLabel === "string"
        ? project.linkLabel
        : `View ${projectTitle} project`;
    link.setAttribute("aria-label", link.textContent);
    article.append(link);
  }

  listItem.append(article);

  return listItem;
};

const renderProjects = (projects) => {
  const fragment = document.createDocumentFragment();

  projects.forEach((project, index) => {
    fragment.append(createProjectCard(project, index));
  });

  projectsList.replaceChildren(fragment);
  projectsList.dataset.state = "success";
  projectsList.setAttribute("aria-busy", "false");
};

const loadProjects = async () => {
  try {
    const response = await fetch("projects.json");

    if (!response.ok) {
      throw new Error("Projects could not be loaded.");
    }

    const projects = await response.json();

    if (!Array.isArray(projects)) {
      throw new Error("Projects data is not an array.");
    }

    renderProjects(projects);
  } catch {
    // Keep the loading skeleton until the final error state is implemented.
  }
};

loadProjects();
