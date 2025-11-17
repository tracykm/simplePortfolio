// renders anything from cloudinary with the tag "cardboard"
// and the home page is based on the tag "cover"

const CLOUDINARY_USERNAME = "spiffysparrow";
const COVER_TAG = "cover";
const SHOWN_TAG = "cardboard";

const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUDINARY_USERNAME}/image`;

// Global variables to store data
let allGrouped = {};
let allCovers = {};
let groupKeys = [];

function renderGroupImages({ grouped, group }) {
  window.group = group;
  $(".back-btn").show();
  $(".thumb-gallery").html("");
  $(".full-images").html(
    grouped[group]
      .map((imgStr) => {
        return `<img class="full-img" id="${imgStr}" src="${CLOUDINARY_URL}/upload//w_1200/${imgStr}" />`;
      })
      .join("")
  );

  // Update URL with deep link
  updateURL(group);

  // Push state for back button functionality (only if not initial load)
  if (!window.initialLoad) {
    history.pushState(
      { view: "detail", group: group },
      `Portfolio - ${group}`,
      `#${group}`
    );
  }
  window.initialLoad = false;
}

function renderThumbs(grouped) {
  $(".back-btn").hide();
  $(".thumb-gallery").html("");
  $(".full-images").html("");
  Object.keys(grouped).forEach((groupName) => {
    const group = grouped[groupName];
    $(".thumb-gallery").prepend(`
          <div class="thumb">
            <a href="#${groupName}">
                <img class="thumb-img" data-group="${groupName}" id="${group[0]}" src="${CLOUDINARY_URL}/upload//w_500/${group[0]}" />
            </a>
          </div>
        `);
  });

  // Clear URL and update history for home view
  updateURL("");
  history.pushState(
    { view: "home" },
    "Portfolio - Home",
    window.location.pathname
  );
}

function updateURL(group) {
  if (group) {
    window.location.hash = group;
  } else {
    // Clear hash
    history.replaceState(
      null,
      null,
      window.location.pathname + window.location.search
    );
  }
}

function handleDeepLink() {
  const hash = window.location.hash.replace("#", "");
  if (hash && allGrouped[hash]) {
    renderGroupImages({ grouped: allGrouped, group: hash });
  } else {
    renderThumbs(allCovers);
  }
}

function navigateToGroup(group) {
  if (allGrouped[group]) {
    renderGroupImages({ grouped: allGrouped, group });
  }
}

// Handle browser back/forward buttons
window.addEventListener("popstate", function (event) {
  if (event.state) {
    if (event.state.view === "home") {
      renderThumbs(allCovers);
    } else if (event.state.view === "detail" && event.state.group) {
      renderGroupImages({ grouped: allGrouped, group: event.state.group });
    }
  } else {
    // Handle direct URL access or refresh
    handleDeepLink();
  }
});

$.ajax(`${CLOUDINARY_URL}/list/${COVER_TAG}.json`).then(({ resources }) => {
  allCovers = resources.reduce((acc, d) => {
    var arr = d.public_id.split("/");
    acc[arr[1]] = acc[arr[1]] || [];
    acc[arr[1]].push(d.public_id + "." + d.format);
    return acc;
  }, {});

  $.ajax(`${CLOUDINARY_URL}/list/${SHOWN_TAG}.json`).then(({ resources }) => {
    allGrouped = resources.reduce((acc, d) => {
      var arr = d.public_id.split("/");
      acc[arr[1]] = acc[arr[1]] || [];
      acc[arr[1]].push(d.public_id + "." + d.format);
      return acc;
    }, {});

    groupKeys = Object.keys(allGrouped);

    // Event handlers
    $("body").on("click", ".thumb-img", (e) => {
      e.preventDefault();
      var group = e.currentTarget.dataset.group;
      renderGroupImages({ grouped: allGrouped, group });
    });

    $("body").on("click", ".back-btn", (e) => {
      e.preventDefault();
      renderThumbs(allCovers);
    });

    $(".home-btn").click((e) => {
      e.preventDefault();
      renderThumbs(allCovers);
    });

    $(".prev-btn").click((e) => {
      e.preventDefault();
      var i = groupKeys.indexOf(window.group);
      i--;
      if (i < 0) {
        i = groupKeys.length - 1;
      }
      var newGroup = groupKeys[i];
      renderGroupImages({ grouped: allGrouped, group: newGroup });
    });

    $(".next-btn").click((e) => {
      e.preventDefault();
      var i = groupKeys.indexOf(window.group);
      i++;
      if (i > groupKeys.length - 1) {
        i = 0;
      }
      var newGroup = groupKeys[i];
      renderGroupImages({ grouped: allGrouped, group: newGroup });
    });

    // Handle initial page load - check for deep link
    handleDeepLink();
  });
});
