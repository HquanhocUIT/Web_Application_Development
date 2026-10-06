const projectsList = document.querySelector("#projects-list");
const projectsStatus = document.querySelector("#projects-status");
const skeletonCardCount = 3;

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

const createSkeletonCard = () => {
  const listItem = document.createElement("li");
  const article = document.createElement("article");
  const titleSkeleton = document.createElement("span");
  const descriptionSkeleton = document.createElement("span");
  const shortLineSkeleton = document.createElement("span");

  listItem.setAttribute("aria-hidden", "true");
  article.className = "project-card project-card--skeleton";
  titleSkeleton.className = "skeleton skeleton--title";
  descriptionSkeleton.className = "skeleton";
  shortLineSkeleton.className = "skeleton skeleton--line-short";
  article.append(titleSkeleton, descriptionSkeleton, shortLineSkeleton);
  listItem.append(article);

  return listItem;
};

const renderLoadingState = () => {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < skeletonCardCount; index += 1) {
    fragment.append(createSkeletonCard());
  }

  projectsList.replaceChildren(fragment);
  projectsList.dataset.state = "loading";
  projectsList.setAttribute("aria-busy", "true");
  projectsList.setAttribute("aria-label", "Projects are loading");
  projectsStatus.textContent = "Loading projects...";
};

const renderSuccessState = (projects) => {
  const fragment = document.createDocumentFragment();

  projects.forEach((project, index) => {
    fragment.append(createProjectCard(project, index));
  });

  projectsList.replaceChildren(fragment);
  projectsList.dataset.state = "success";
  projectsList.setAttribute("aria-busy", "false");
  projectsList.setAttribute("aria-label", "Projects");
  projectsStatus.textContent = "Projects loaded.";
};

const renderEmptyState = () => {
  projectsList.replaceChildren();
  projectsList.dataset.state = "empty";
  projectsList.setAttribute("aria-busy", "false");
  projectsList.setAttribute("aria-label", "No projects available");
  projectsStatus.textContent = "No projects are available yet.";
};

const renderErrorState = () => {
  const retryButton = document.createElement("button");

  projectsList.replaceChildren();
  projectsList.dataset.state = "error";
  projectsList.setAttribute("aria-busy", "false");
  projectsList.setAttribute("aria-label", "Projects failed to load");

  retryButton.type = "button";
  retryButton.className = "project-retry";
  retryButton.textContent = "Retry";
  retryButton.setAttribute("aria-label", "Retry loading projects");
  retryButton.addEventListener("click", loadProjects);

  projectsStatus.replaceChildren(
    document.createTextNode("Unable to load projects. "),
    retryButton
  );
};

const loadProjects = async () => {
  renderLoadingState();

  try {
    const response = await fetch("./projects.json");

    if (!response.ok) {
      throw new Error("Projects could not be loaded.");
    }

    const projects = await response.json();

    if (!Array.isArray(projects)) {
      throw new Error("Projects data is not an array.");
    }

    if (projects.length === 0) {
      renderEmptyState();
      return;
    }

    renderSuccessState(projects);
  } catch {
    renderErrorState();
  }
};

loadProjects();
