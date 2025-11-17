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
let currentFilter = "all";
let groupMetadata = {}; // Store creation dates for sorting

const filters = {
  bugs: [],
  plants: ["plant", "sunflower", "carrot", "onion"],
  "other animals": ["animal", "sloth", "lizard", "gecko", "owl", "fish"],
};

function renderGroupImages({ grouped, group }) {
  window.group = group;
  $(".back-btn").show();
  $(".filter-buttons").hide();
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

  // Manage history state for back button functionality
  if (!window.initialLoad) {
    history.pushState(
      { view: "detail", group: group },
      `Portfolio - ${group}`,
      `#${group}`
    );
  } else {
    // Replace state on initial load to avoid duplicate entries
    history.replaceState(
      { view: "detail", group: group },
      `Portfolio - ${group}`,
      `#${group}`
    );
  }
  window.initialLoad = false;
}

function filterGroups(grouped, filter) {
  if (filter === "all") {
    return grouped;
  }

  const filtered = {};
  Object.keys(grouped).forEach((groupName) => {
    const lowerGroupName = groupName.toLowerCase();
    let shouldInclude = false;

    // Check if group belongs to the selected filter category
    if (filter === "plants") {
      shouldInclude = filters.plants.some((plant) =>
        lowerGroupName.includes(plant.toLowerCase())
      );
      debugger;
    } else if (filter === "other animals") {
      shouldInclude = filters["other animals"].some((animal) =>
        lowerGroupName.includes(animal.toLowerCase())
      );
    } else if (filter === "bugs") {
      // For bugs filter, include groups that don't match plants or other animals (fallback)
      const isPlant = filters.plants.some((plant) =>
        lowerGroupName.includes(plant.toLowerCase())
      );
      const isOtherAnimal = filters["other animals"].some((animal) =>
        lowerGroupName.includes(animal.toLowerCase())
      );
      shouldInclude = !isPlant && !isOtherAnimal; // Fallback: if not plant or other animal, then it's bugs
    }

    if (shouldInclude) {
      filtered[groupName] = grouped[groupName];
    }
  });

  console.log(
    `Filter "${filter}" resulted in ${Object.keys(filtered).length} groups:`,
    Object.keys(filtered)
  );

  return filtered;
}

function renderThumbs(grouped) {
  $(".back-btn").hide();
  $(".filter-buttons").show();
  $(".thumb-gallery").html("");
  $(".full-images").html("");

  // Apply current filter
  const filteredGroups = filterGroups(grouped, currentFilter);

  // Sort groups by most recent creation date
  const sortedGroupNames = Object.keys(filteredGroups).sort((a, b) => {
    const dateA = groupMetadata[a]
      ? new Date(groupMetadata[a].created_at)
      : new Date(0);
    const dateB = groupMetadata[b]
      ? new Date(groupMetadata[b].created_at)
      : new Date(0);
    return dateB - dateA; // Most recent first
  });

  sortedGroupNames.forEach((groupName) => {
    const group = filteredGroups[groupName];
    $(".thumb-gallery").append(`
          <div class="thumb">
            <a href="#${groupName}">
                <img class="thumb-img" data-group="${groupName}" id="${group[0]}" src="${CLOUDINARY_URL}/upload//w_500/${group[0]}" />
            </a>
          </div>
        `);
  });

  // Clear URL and update history for home view
  updateURL("");
  if (!window.initialLoad) {
    history.pushState(
      { view: "home" },
      "Portfolio - Home",
      window.location.pathname
    );
  } else {
    // Replace state on initial load to avoid duplicate entries
    history.replaceState(
      { view: "home" },
      "Portfolio - Home",
      window.location.pathname
    );
  }
  window.initialLoad = false;
}

function updateURL(group) {
  if (group) {
    window.location.hash = group;
  } else {
    // Clear hash without affecting history
    if (window.location.hash) {
      window.location.hash = "";
    }
  }
}

function handleDeepLink() {
  const hash = window.location.hash.replace("#", "");
  window.initialLoad = true;
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
  window.initialLoad = true;
  if (event.state) {
    if (event.state.view === "home") {
      renderThumbs(allCovers);
    } else if (event.state.view === "detail" && event.state.group) {
      renderGroupImages({ grouped: allGrouped, group: event.state.group });
    }
  } else {
    // Handle direct URL access or when going back to initial state
    const hash = window.location.hash.replace("#", "");
    if (hash && allGrouped[hash]) {
      renderGroupImages({ grouped: allGrouped, group: hash });
    } else {
      renderThumbs(allCovers);
    }
  }
});

$.ajax(`${CLOUDINARY_URL}/list/${COVER_TAG}.json`).then(({ resources }) => {
  allCovers = resources.reduce((acc, d) => {
    var arr = d.public_id.split("/");
    const groupName = arr[1];
    acc[groupName] = acc[groupName] || [];
    acc[groupName].push(d.public_id + "." + d.format);

    // Store metadata for sorting (use the most recent image in each group)
    if (
      !groupMetadata[groupName] ||
      (d.created_at && d.created_at > groupMetadata[groupName].created_at)
    ) {
      groupMetadata[groupName] = {
        created_at: d.created_at || new Date().toISOString(),
        public_id: d.public_id,
      };
    }

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

    $("body").on("click", ".filter-btn", (e) => {
      e.preventDefault();
      const filter = e.currentTarget.dataset.filter;
      currentFilter = filter;

      // Update active button
      $(".filter-btn").removeClass("active");
      $(e.currentTarget).addClass("active");

      // Re-render thumbnails with new filter
      renderThumbs(allCovers);
    });

    $(".home-btn").click((e) => {
      e.preventDefault();
      currentFilter = "all";
      $(".filter-btn").removeClass("active");
      $(".filter-btn[data-filter='all']").addClass("active");
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
