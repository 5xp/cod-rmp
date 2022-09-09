class Section {
  constructor(className, instructorName) {
    this.className = className;
    this.instructorName = instructorName;

    const [lastName, firstInitial] = instructorName.split(", ");
    this.lastName = lastName;
    this.firstInitial = firstInitial;

    this.rating = null;
  }

  async fetchProfessor() {
    console.log("fetching professor");
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          contentScriptQuery: "queryTeachers",
          lastName: this.lastName,
          firstInitial: this.firstInitial,
        },
        response => {
          if (response.complete !== true) {
            this.rating = null;
            this.numRatings = null;
            this.id = null;
            reject();
          }

          this.rating = response.rating;
          this.numRatings = response.numRatings;
          this.id = response.id;
          resolve();
        }
      );
    });
  }

  getLink() {
    return `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${this.id}`;
  }
}
