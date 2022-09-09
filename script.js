const sectionSet = new Set();

const sections = [];

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

async function handleSection(section) {
  const sectionName = section.innerText.match(/[^.*\n]*/)[0];

  const instructor = section.innerText.match(/Instructor: [^.*\n]*/)[0];

  if (!instructor.startsWith("Instructor")) {
    console.log(section);
  }

  if (instructor === "Instructor: TBD") {
    return;
  }

  const instructorName = instructor.substring(12);

  const sec = new Section(sectionName, instructorName);
  await sec.fetchProfessor();

  // add a rating to the section html
  const rating = document.createElement("div");
  rating.className = "schedule-listitem-rating";

  rating.style.color = "#2b76f0";
  rating.style.border = "0.07em solid #2b76f0";
  rating.style.borderRadius = "0.5em";
  rating.style.padding = "0.5em";
  rating.style.margin = "0.5em";
  rating.style.backgroundColor = "#b0ceff";

  const ratingText = document.createElement("div");
  ratingText.textContent = `Average RMP Rating: ${sec.rating} (${sec.numRatings} ratings)`;
  rating.appendChild(ratingText);

  // open the professor's ratemyprofessor page on click
  rating.addEventListener("click", event => {
    window.open(sec.getLink());
    // prevent click from opening the section
    event.preventDefault();
    event.stopPropagation();
  });

  section.appendChild(rating);
}

const onUpdate = debounce(() => {
  for (section of sectionSet) {
    handleSection(section);
  }
}, 100);

function handleNode(node) {
  if (node.classList && node.classList.contains("schedule-listitem-rating")) {
    return;
  }

  const className = node.parentElement?.className;
  const expanded = node.parentElement
    ?.closest("div.schedule-listitem-newbody")
    ?.querySelector("div.schedule-listitem-footerexpanded");

  if (className === "schedule-availablesection" && expanded) {
    const section = node.parentElement;
    sectionSet.add(section);
    onUpdate();
  }
}

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    if (mutation.type !== "childList") return;

    for (const node of mutation.addedNodes) {
      handleNode(node);
    }
  }
});

const schedule = document.getElementById("schedplan-schedule");

observer.observe(schedule, {
  childList: true,
  subtree: true,
});
