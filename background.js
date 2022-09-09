chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery === "queryTeachers") {
    request.lastName = request.lastName.toLowerCase();
    const name = `${request.lastName} ${request.firstInitial}`;

    var url = "https://www.ratemyprofessors.com/graphql";
    var body = JSON.stringify({
      query: `query TeacherSearchResultsPageQuery(
        $query: TeacherSearchQuery!
        $schoolID: ID
      ) {
        search: newSearch {
          ...TeacherSearchPagination_search_1ZLmLD
        }
        school: node(id: $schoolID) {
          __typename
          ... on School {
            name
          }
          id
        }
      }
      
      fragment TeacherSearchPagination_search_1ZLmLD on newSearch {
        teachers(query: $query, first: 8, after: "") {
          didFallback
          edges {
            cursor
            node {
              ...TeacherCard_teacher
              id
              __typename
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          resultCount
          filters {
            field
            options {
              value
              id
            }
          }
        }
      }
      
      fragment TeacherCard_teacher on Teacher {
        id
        legacyId
        avgRating
        numRatings
        ...CardFeedback_teacher
        ...CardSchool_teacher
        ...CardName_teacher
        ...TeacherBookmark_teacher
      }
      
      fragment CardFeedback_teacher on Teacher {
        wouldTakeAgainPercent
        avgDifficulty
      }
      
      fragment CardSchool_teacher on Teacher {
        department
        school {
          name
          id
        }
      }
      
      fragment CardName_teacher on Teacher {
        firstName
        lastName
      }
      
      fragment TeacherBookmark_teacher on Teacher {
        id
        isSaved
      }
      `,
      variables: {
        query: {
          text: name,
          schoolID: "U2Nob29sLTE4ODE=",
          fallback: true,
          departmentID: null,
        },
        schoolID: "U2Nob29sLTE4ODE=",
      },
    });

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Basic dGVzdDp0ZXN0",
      },
      body: body,
    })
      .then(res => res.json())
      .then(json => {
        const ratings = json.data.search.teachers.edges;

        if (ratings.length === 0) {
          sendResponse({ rating: null, numRatings: null, id: null, complete: false });
          return;
        }

        const rating = ratings[0].node;
        sendResponse({ rating: rating.avgRating, numRatings: rating.numRatings, id: rating.legacyId, complete: true });
      });
  }
  return true;
});
