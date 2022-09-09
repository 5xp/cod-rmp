const professorMap = new Map();
const sectionSet = new Set();

// Populates professorMap when a new section element is detected
async function populateSection(html) {
  const sectionName = html.innerText.match(/[^.*\n]*/)[0]; // doesn't work when waitlisted
  const instructor = html.innerText.match(/Instructor: [^.*\n]*/)[0];

  // couldn't find professor name for some reason
  if (!instructor.startsWith("Instructor")) {
    console.error(html);
    return;
  }

  // no professor
  if (instructor === "Instructor: TBD") {
    return;
  }

  // remove "Instructor: " from the name
  const instructorName = instructor.substring(12);

  if (!professorMap.has(instructorName)) {
    professorMap.set(instructorName, new Professor(instructorName));
  }

  const prof = professorMap.get(instructorName);

  const section = new Section(sectionName, prof, html);

  await section.addRating();
}

// wait for 50 ms before handling new sections to prevent too many calls
// async to prevent duplicate requests to ratemyprofessors.com
const handleNewSections = debounce(async () => {
  for (section of sectionSet) {
    await populateSection(section);
  }
  sectionSet.clear();
}, 50);

function handleNode(node) {
  // ignore nodes created by the extension
  if (node.classList?.contains("schedule-listitem-rating")) {
    return;
  }

  const className = node.parentElement?.className;

  if (className === "schedule-availablesection") {
    const section = node.parentElement;
    sectionSet.add(section);
    handleNewSections();
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
