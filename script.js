// renders anything from cloudianry with the tag "cardboard"
// and the home page is based on the tag "cover"

function renderGroupImages({ grouped, group }) {
  window.group = group;
  $(".thumb-gallery").html("");
  $(".full-images").html(
    grouped[group]
      .map(imgStr => {
        return `<img class="full-img" id="${imgStr}" src="https://res.cloudinary.com/spiffysparrow/image/upload//w_1200/${imgStr}" />`;
      })
      .join("")
  );
}

function renderThumbs(grouped) {
  $(".full-images").html("");
  Object.keys(grouped).forEach(groupName => {
    const group = grouped[groupName];
    $(".thumb-gallery").prepend(`
          <div class="thumb">
            <a href="#ex1" rel="modal:open">
                <img class="thumb-img" data-group="${groupName}" id="${
      group[0]
    }" src="https://res.cloudinary.com/spiffysparrow/image/upload//w_500/${
      group[0]
    }" />
            </a>
          </div>
        `);
  });
}

let covers = {};

$.ajax("https://res.cloudinary.com/spiffysparrow/image/list/cover.json").then(
  ({ resources }) => {
    covers = resources.reduce((acc, d) => {
      var arr = d.public_id.split("/");
      acc[arr[1]] = acc[arr[1]] || [];
      acc[arr[1]].push(d.public_id + "." + d.format);
      return acc;
    }, {});
    renderThumbs(covers);

    $.ajax(
      "https://res.cloudinary.com/spiffysparrow/image/list/cardboard.json"
    ).then(({ resources }) => {
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
  }
);
