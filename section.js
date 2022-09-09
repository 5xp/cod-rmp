const good = { border: "0.07em solid #11BA11", color: "#11BA11", backgroundColor: "#96F296" };
const bad = { border: "0.07em solid #C21316", color: "#C21316", backgroundColor: "#FF8C8E" };
const okay = { border: "0.07em solid #D68D04", color: "#D68D04", backgroundColor: "#FFE87A" };

class Section {
  constructor(course, professor, html) {
    this.course = course;
    this.professor = professor;
    this.html = html;
  }

  async addRating() {
    if (this.professor.rating === null) {
      await this.professor.fetchProfessor();
    }

    let quality;

    if (this.professor.rating < 3) {
      quality = bad;
    } else if (this.professor.rating < 4) {
      quality = okay;
    } else {
      quality = good;
    }

    const rating = document.createElement("div");
    rating.className = "schedule-listitem-rating";

    rating.style.color = quality.color;
    rating.style.border = quality.border;
    rating.style.borderRadius = "0.5em";
    rating.style.padding = "0.5em";
    rating.style.margin = "0.5em";
    rating.style.backgroundColor = quality.backgroundColor;

    const ratingText = document.createElement("div");
    ratingText.textContent = `Average RMP Rating: ${this.professor.rating} (${this.professor.numRatings} ratings)`;
    rating.appendChild(ratingText);

    // open the professor's ratemyprofessor page on click
    rating.addEventListener("click", event => {
      window.open(this.professor.getLink());
      // prevent click from opening the section
      event.preventDefault();
      event.stopPropagation();
    });

    this.html.appendChild(rating);
  }
}
