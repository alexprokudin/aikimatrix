if (typeof(matrix) === "undefined") {
  var matrix = [];
}

$(function() {
  let colorTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  $("body").attr('data-bs-theme', colorTheme)
  $("#switchDarkMode").prop("checked", colorTheme == "dark");

  $("#switchDarkMode").change(function() {
    let colorTheme = $("#switchDarkMode").prop("checked") ? 'dark' : 'light';
    $("body").attr('data-bs-theme', colorTheme);
  });

  let baseurl = window.location.href.split("#")[0];
  let sensei = window.location.hash.substring(1);

  matrix.sort(function (a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  // sensei available? if not, blank out to default
  if (sensei) {
    let sensei_ = '';
    for (i=0; i<matrix.length; i++) {
      if (matrix[i].tag == sensei) {
        sensei_ = matrix[i].tag;
      }
    }
    sensei = sensei_;
  }

  for (i=0; i<matrix.length; i++) {
    if (!sensei && matrix[i].default) {
      sensei = matrix[i].tag;
    }

    let initial = matrix[i].name.charAt(0);
    let $optgroup = $("#" + initial, $("#contentcreator"));

    if (!$optgroup.length) {
      $optgroup = $('<optgroup id="' + initial + '" label="' + initial + '…" />')
      $("#contentcreator").append($optgroup);
    }

    let $option = $("<option />")
      .html(matrix[i].name)
      .attr("value", matrix[i].tag)
      .data("m", matrix[i]);

    if (sensei === matrix[i].tag) {
      $option.attr("selected", "selected");
    }
    $optgroup.append($option);
  }

  /*
  // export as anki/noji importable flashcard deck (CSV)
  let csv = "";
  $.each(matrix[2]["urls"], function(x, n) {
    $.each(n, function(y, m) {
      let defaultUrl = "";
      let alternativeUrl = "";

      matrix.forEach(function(item, index) {
        let url = "";
        if (typeof(matrix[index]["urls"][x][y].youtube) !== "undefined") {
          url = "https://www.youtube.com/watch/" +
            "?v=" + matrix[index]["urls"][x][y].youtube.video +
            '&t=' + matrix[index]["urls"][x][y].youtube.time[0];
        }
        if (url) {
         if (matrix[index].default) {
           defaultUrl += "<a href=\"" + url + "\">" + matrix[index].name + "</a><br>";
         } else {
           alternativeUrl += "<a href=\"" + url + "\">" + matrix[index].name + "</a><br>";
         }
        }
      });
      let kyu = 0;
      $("td.kyu").each(function(a, b) {
        if (x == $(b).data("angriff") && y == $(b).data("technik")) {
          kyu = $(b).data("kyu");
        }
      });
      if (kyu == 1) {
        csv += kyu + ". Kyu<br>" + "<br>" + m.label.replaceAll(" - ", "<br>") + "\t" + defaultUrl + "<br>" + alternativeUrl + "\n";
      }
    });
  });
  console.log(csv);
  */

  $("#contentcreator").change(function() {
    window.location.href = baseurl + '#' + $(this).val();
    let m = $('option:selected', $(this)).data("m");

    $("a#tomobile").attr(
      "href",
      $("a#tomobile").data("baseref") + '#' + $(this).val()
    );

    $("a#sensei-url")
      .attr("href", m["url"])
      .html(m["url"]);

    $("a#todesktop").attr(
      "href",
      $("a#todesktop").data("baseref") + '#' + $(this).val()
    );

    document.title = 'Aikimatrix - ' + m["name"];

    $("span#sensei-name").html(m["name"]);

    // Mobile
    $("a.kyu").each(function() {
      let angriff = Number($(this).data("angriff"));
      let technik = Number($(this).data("technik"));
      $(this).addClass("missing").removeClass("youtube").removeAttr("href").removeAttr("target").data("youtube", null);

      if (
        (typeof(m["urls"][angriff]) !== "undefined") &&
        (typeof(m["urls"][angriff][technik]) !== "undefined")
      ) {
        if (
          (typeof(m["urls"][angriff][technik]["url"]) !== "undefined") &&
          m["urls"][angriff][technik]["url"].length > 0
        ) {
          let url =
            ((typeof(m["urls"][angriff][technik]["url"]) !== "undefined") && m["urls"][angriff][technik]["url"].length > 0)
              ? m["urls"][angriff][technik]["url"]
              : false;

          $(this).removeClass("missing").removeClass("youtube")
            .data("url", m["urls"][angriff][technik]["url"])
            .data("label", m["urls"][angriff][technik]["label"]);
        }

        if(
          (typeof(m["urls"][angriff][technik]["youtube"]) !== "undefined")
        ) {
          $(this).removeClass("missing").addClass("youtube")
            .data('youtube', m["urls"][angriff][technik]["youtube"])
            .data('label', m["urls"][angriff][technik]["label"]);
        }
      }
    });

    // Desktop
    $('table#matrix td.kyu').each(function() {
      let angriff = Number($(this).data("angriff"));
      let technik = Number($(this).data("technik"));
      let kyu = $(this).data("kyu");
      let isKyu0 = (kyu == 0);
      let displayVal = isKyu0 ? '0' : kyu;

      // Reset cell to default state
      $(this).html(displayVal).removeClass('kyu-0-linked missing').removeAttr('title');
      if (!isKyu0) {
        $(this).attr('title', 'missing').addClass('missing');
      }

      // Apply URL / youtube link if one exists for this cell
      if (
        (typeof(m["urls"][angriff]) !== "undefined") &&
        (typeof(m["urls"][angriff][technik]) !== "undefined")
      ) {
        let urlData = m["urls"][angriff][technik];
        let url = (typeof(urlData["url"]) !== "undefined" && urlData["url"].length > 0)
          ? urlData["url"]
          : false;

        if (url || (typeof(urlData["youtube"]) !== "undefined")) {
          let titleText = urlData["label"] + (isKyu0 ? '' : ' (' + kyu + '. kyu)');
          let $a = $(
            '<a ' +
              'title="' + titleText + '" ' +
              'target="_blank" class="kyu desktop">' +
              displayVal +
            '</a>'
          );
          $a
            .data("youtube", urlData["youtube"])
            .data("desktop", 1)
            .data("url", url)
            .data("label", urlData["label"]);

          $(this).html($a).attr("title", urlData["label"]);
          if (isKyu0) {
            $(this).addClass('kyu-0-linked');
          } else {
            $(this).removeClass('missing');
          }
        }
      }
    });

    $("a.kyu").unbind("click").click(function() {
      if ($(this).hasClass("missing")) {
        return;
      }
      let youtube = $(this).data("youtube");

      let url = '';
      if (typeof(youtube) !== "undefined" && youtube) {
        let src = "https://www.youtube.com/embed/" + youtube.video
          + "?autoplay=1&mute=1&start=" + youtube.time[0]
          + (youtube.time[1] ? "&end=" + youtube.time[1] : "");
        let $iframe = '<iframe width="100%" height="100%" src="' + src + '" frameBorder="0" allow="autoplay" allowfullscreen></iframe>';
        let $dlg = $("div#youtube");
        $(".modal-title", $dlg).html($(this).data("label"));
        $(".modal-body").empty().append($iframe);
        if ($(this).data("desktop")) {
          $dlg.show();
        } else {
          $dlg.modal('toggle');
        }
        return;
      }

      // Non-YouTube URL
      url = $(this).data('url');
      let $iframe = '<iframe width="100%" height="100%" src="' + url + '" frameBorder="0"></iframe>';
      let $dlg = $("div#youtube");
      $(".modal-title", $dlg).html($(this).data("label"));
      $(".modal-body").empty().append($iframe);
      if ($(this).data("desktop")) {
        $dlg.show();
      } else {
        $dlg.modal('toggle');
      }
    })

  }).change();

  $("#closeYoutube").click(function() {
    let $dlg = $("div#youtube");
    $(".modal-body").empty();
    $dlg.modal('toggle');
  });

  $("span.close").click(function() {
    let $dlg = $("div#youtube");
    $(".modal-body").empty();
    $dlg.hide();
  });
})
