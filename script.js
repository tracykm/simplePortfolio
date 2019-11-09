// renders anything from cloudinary with the tag "cardboard"
// and the home page is based on the tag "cover"

const CLOUDINARY_USERNAME = "spiffysparrow";
const COVER_TAG = "cover";
const SHOWN_TAG = "cardboard";

const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUDINARY_USERNAME}/image`;

function renderGroupImages({ grouped, group }) {
  window.group = group;
  $(".thumb-gallery").html("");
  $(".full-images").html(
    grouped[group]
      .map(imgStr => {
        return `<img class="full-img" id="${imgStr}" src="${CLOUDINARY_URL}/upload//w_1200/${imgStr}" />`;
      })
      .join("")
  );
}

function renderThumbs(grouped) {
  $(".thumb-gallery").html("");
  $(".full-images").html("");
  Object.keys(grouped).forEach(groupName => {
    const group = grouped[groupName];
    $(".thumb-gallery").prepend(`
          <div class="thumb">
            <a href="#ex1" rel="modal:open">
                <img class="thumb-img" data-group="${groupName}" id="${
      group[0]
    }" src="${CLOUDINARY_URL}/upload//w_500/${group[0]}" />
            </a>
          </div>
        `);
  });
}

let covers = {};

$.ajax(`${CLOUDINARY_URL}/list/${COVER_TAG}.json`).then(({ resources }) => {
  covers = resources.reduce((acc, d) => {
    var arr = d.public_id.split("/");
    acc[arr[1]] = acc[arr[1]] || [];
    acc[arr[1]].push(d.public_id + "." + d.format);
    return acc;
  }, {});
  renderThumbs(covers);

  $.ajax(`${CLOUDINARY_URL}/list/${SHOWN_TAG}.json`).then(({ resources }) => {
    const grouped = resources.reduce((acc, d) => {
      var arr = d.public_id.split("/");
      acc[arr[1]] = acc[arr[1]] || [];
      acc[arr[1]].push(d.public_id + "." + d.format);
      return acc;
    }, {});

    const groupKeys = Object.keys(grouped);

    $("body").on("click", ".thumb-img", e => {
      var group = e.currentTarget.dataset.group;
      renderGroupImages({ grouped, group });
    });

    $(".home-btn").click(() => {
      renderThumbs(covers);
    });
    $(".prev-btn").click(() => {
      var i = groupKeys.indexOf(window.group);
      i--;
      if (i < 0) {
        i = groupKeys.length - 1;
      }
      var newGroup = groupKeys[i];

      renderGroupImages({ grouped, group: newGroup });
    });
    $(".next-btn").click(() => {
      var i = groupKeys.indexOf(window.group);
      i++;
      if (i > groupKeys.length - 1) {
        i = 0;
      }
      var newGroup = groupKeys[i];

      renderGroupImages({ grouped, group: newGroup });
    });
  });
});
