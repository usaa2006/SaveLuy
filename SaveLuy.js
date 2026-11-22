var K = "smp-km-1",
  S;
try {
  S = JSON.parse(localStorage.getItem(K));
} catch (e) {}
S = S || { c: [] };
var view = "home",
  cm = new Date(),
  sd = null,
  armed = null,
  newDays = 50;
var M =
    "មករា កុម្ភៈ មីនា មេសា ឧសភា មិថុនា កក្កដា សីហា កញ្ញា តុលា វិច្ឆិកា ធ្នូ".split(
      " ",
    ),
  W = "អា ច អ ព ព្រ សុ ស".split(" ");
var NAV = [
  ["home", "🏠", "ទំព័រដើម"],
  ["goals", "🎯", "គោលដៅ"],
  ["cal", "📅", "ប្រតិទិន"],
  ["hist", "🧾", "ប្រវត្តិ"],
  ["ach", "🏆", "ពានរង្វាន់"],
];
var QS = [
  "រាល់ដុល្លារសំខាន់ណាស់។ បន្តឆ្ពោះទៅរកគោលដៅរបស់អ្នក។",
  "អនាគតរបស់អ្នកកើតពីអ្វីដែលអ្នកសន្សំថ្ងៃនេះ។",
  "សន្សំបន្តិច ល្អជាងមិនសន្សំ។",
  "រក្សាភាពជាប់លាប់ អ្នកកាន់តែជិតជាងម្សិលមិញ។",
];
var TPL = [
  ["$1 / ថ្ងៃ", 50, 1],
  ["$2 / ថ្ងៃ", 100, 2],
  ["$5 / ថ្ងៃ", 250, 5],
  ["$10 / ថ្ងៃ", 500, 10],
  ["៧ ថ្ងៃ", 7, 1],
  ["៣០ ថ្ងៃ", 30, 1],
  ["១០០ ថ្ងៃ", 100, 1],
];
var ICONS = [
  "⭐",
  "📱",
  "💻",
  "🏍️",
  "🎮",
  "✈️",
  "🎓",
  "🛟",
  "🎂",
  "🛍️",
  "💼",
];
function $(n) {
  return "$" + Math.round(n * 100) / 100;
}
function ds(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
function T() {
  return ds(new Date());
}
function save() {
  try {
    localStorage.setItem(K, JSON.stringify(S));
  } catch (e) {}
}
function diff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 864e5);
}
function allTx() {
  var r = [];
  S.c.forEach(function (c) {
    c.tx.forEach(function (t) {
      r.push({ d: t.d, a: t.a, n: t.n, t: c.title, i: c.icon });
    });
  });
  return r.sort(function (a, b) {
    return a.d < b.d ? 1 : -1;
  });
}
function dates() {
  var o = {};
  allTx().forEach(function (t) {
    o[t.d] = (o[t.d] || 0) + t.a;
  });
  return o;
}
function streaks() {
  var D = dates(),
    a = Object.keys(D).sort(),
    best = 0,
    run = 0,
    p = null;
  a.forEach(function (d) {
    run = p && diff(p, d) == 1 ? run + 1 : 1;
    if (run > best) best = run;
    p = d;
  });
  var cur = 0,
    d = new Date();
  if (!D[ds(d)]) d.setDate(d.getDate() - 1);
  while (D[ds(d)]) {
    cur++;
    d.setDate(d.getDate() - 1);
  }
  return { cur: cur, best: best };
}
function total() {
  return S.c.reduce(function (s, c) {
    return s + c.saved;
  }, 0);
}
function days(c) {
  return Math.ceil((c.target - c.saved) / c.daily);
}
function toast(m) {
  var t = document.getElementById("toast");
  t.textContent = m;
  t.className = "on";
  setTimeout(function () {
    t.className = "";
  }, 2600);
}
function setAv() {
  var e = document.getElementById("av");
  if (!e) return;
  e.innerHTML = S.av ? '<img alt="" src="' + S.av + '">' : "👤";
  document.getElementById("avx").style.display = S.av ? "" : "none";
}
function upl(f) {
  if (!f) return;
  if (!/^image\//.test(f.type)) {
    toast("សូមជ្រើសរើសឯកសាររូបភាព");
    return;
  }
  var r = new FileReader();
  r.onload = function () {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement("canvas");
      c.width = c.height = 160;
      var x = c.getContext("2d"),
        s = Math.min(im.width, im.height);
      x.drawImage(
        im,
        (im.width - s) / 2,
        (im.height - s) / 2,
        s,
        s,
        0,
        0,
        160,
        160,
      );
      S.av = c.toDataURL("image/jpeg", 0.85);
      save();
      setAv();
      toast("បានប្តូររូបភាពប្រវត្តិរូបរួចរាល់ ✓");
    };
    im.onerror = function () {
      toast("មិនអាចអានរូបភាពនេះបានទេ");
    };
    im.src = r.result;
  };
  r.readAsDataURL(f);
}
function delAv() {
  delete S.av;
  save();
  setAv();
  toast("បានលុបរូបភាព");
}
function theme() {
  var r = document.documentElement,
    d = r.dataset.theme
      ? r.dataset.theme == "dark"
      : matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme = d ? "light" : "dark";
}
function go(v) {
  view = v;
  render();
  scrollTo(0, 0);
}
function checkin(id) {
  var c = S.c.find(function (x) {
    return x.id == id;
  });
  if (
    !c ||
    c.status != "active" ||
    c.tx.some(function (t) {
      return t.d == T();
    })
  )
    return;
  var a = Math.min(c.daily, c.target - c.saved);
  c.saved = Math.round((c.saved + a) * 100) / 100;
  c.tx.push({ d: T(), a: a, n: c.tx.length + 1 });
  if (c.saved >= c.target) {
    c.status = "done";
    c.done = T();
    save();
    render();
    document.getElementById("wm").textContent =
      "អ្នកបានបញ្ចប់គោលដៅ «" +
      c.title +
      "» — សន្សំសរុប " +
      $(c.saved) +
      " ក្នុង " +
      c.tx.length +
      " ថ្ងៃ។ ពាន: ម្ចាស់ជើងឯកសន្សំ 🏅";
    document.getElementById("win").className = "on";
    var r = document.createElement("div");
    r.className = "rain";
    for (var i = 0; i < 40; i++)
      r.innerHTML +=
        '<s style="left:' +
        Math.random() * 100 +
        "%;animation-delay:" +
        Math.random() * 1.5 +
        's">' +
        ["🎉", "✨", "💚", "🪙"][i % 4] +
        "</s>";
    document.body.appendChild(r);
    setTimeout(function () {
      r.remove();
    }, 5000);
    return;
  }
  save();
  render();
  toast("ពូកែណាស់! អ្នកបានសន្សំ " + $(a) + " ថ្ងៃនេះ។ បន្តទៅមុខទៀត!");
}
function closeWin() {
  document.getElementById("win").className = "";
}
function ring(p) {
  var c = 2 * Math.PI * 58;
  return (
    '<div class="ring"><svg width="150" height="150"><circle cx="75" cy="75" r="58" fill="none" stroke="var(--mint)" stroke-width="14"/><circle cx="75" cy="75" r="58" fill="none" stroke="var(--em)" stroke-width="14" stroke-linecap="round" stroke-dasharray="' +
    c +
    '" stroke-dashoffset="' +
    c * (1 - p / 100) +
    '" style="transition:stroke-dashoffset .8s"/></svg><div><span>' +
    Math.round(p) +
    "%<i>បានសម្រេច</i></span></div></div>"
  );
}
function card(c, full) {
  var p = Math.min(100, (c.saved / c.target) * 100),
    done = c.tx.some(function (t) {
      return t.d == T();
    }),
    st = streaks();
  var est = new Date();
  est.setDate(est.getDate() + days(c) - (done ? 0 : 1));
  var btn =
    c.status == "done"
      ? '<button class="big" disabled>🏅 បានបញ្ចប់</button>'
      : c.status == "paused"
        ? '<button class="big" disabled>⏸ កំពុងផ្អាក</button>'
        : done
          ? '<button class="big" disabled>✓ បានសន្សំថ្ងៃនេះរួចហើយ</button>'
          : '<button class="big" onclick="checkin(' +
            c.id +
            ')">សន្សំ ' +
            $(Math.min(c.daily, c.target - c.saved)) +
            " ថ្ងៃនេះ</button>";
  return (
    '<div class="card"><div class="hero">' +
    ring(p) +
    '<div style="flex:1;min-width:200px"><div class="row"><h2 style="margin:0">' +
    c.icon +
    " " +
    c.title +
    '</h2></div><p class="mut" style="margin:4px 0 10px">ថ្ងៃទី ' +
    c.tx.length +
    " / " +
    (c.tx.length + (c.status == "done" ? 0 : days(c))) +
    " · គោលដៅ " +
    $(c.target) +
    " · សល់ " +
    $(c.target - c.saved) +
    '</p><div class="bar"><i style="width:' +
    p +
    '%"></i></div><p class="mut">សន្សំបាន ' +
    $(c.saved) +
    " · ត្រូវការ " +
    (c.status == "done" ? 0 : days(c)) +
    " ថ្ងៃទៀត" +
    (c.status == "active"
      ? " · ប៉ាន់ស្មានបញ្ចប់ " + est.getDate() + " " + M[est.getMonth()]
      : "") +
    "</p></div></div>" +
    btn +
    (full
      ? '<div class="row" style="margin-top:12px"><span class="mut">ជាប់គ្នា ' +
        st.cur +
        " ថ្ងៃ · រំលងថ្ងៃបានដោយមិនបាត់លុយ</span><span>" +
        (c.status != "done"
          ? '<button class="btn" onclick="pause(' +
            c.id +
            ')">' +
            (c.status == "paused" ? "បន្ត" : "ផ្អាក") +
            "</button> "
          : "") +
        '<button class="btn" onclick="del(' +
        c.id +
        ')">' +
        (armed == c.id ? "ប្រាកដទេ?" : "លុប") +
        "</button></span></div>"
      : "") +
    "</div>"
  );
}
function pause(id) {
  var c = S.c.find(function (x) {
    return x.id == id;
  });
  c.status = c.status == "paused" ? "active" : "paused";
  save();
  render();
}
function del(id) {
  if (armed != id) {
    armed = id;
    render();
    setTimeout(function () {
      armed = null;
    }, 3000);
    return;
  }
  S.c = S.c.filter(function (c) {
    return c.id != id;
  });
  armed = null;
  save();
  render();
}
function create() {
  var t = document.getElementById("t").value.trim(),
    g = +document.getElementById("g").value,
    d = +document.getElementById("d").value;
  if (!t || !(g > 0) || !(d > 0) || d > g) {
    toast("សូមបញ្ចូលឈ្មោះ និងចំនួនទឹកប្រាក់ឱ្យត្រឹមត្រូវ");
    return;
  }
  S.c.push({
    id: Date.now(),
    title: t,
    icon: document.getElementById("i").value,
    target: g,
    daily: d,
    saved: 0,
    status: "active",
    start: T(),
    tx: [],
  });
  save();
  go("home");
  toast("បានបង្កើតគោលដៅថ្មី! 🎯");
}
function tpl(n, g, d) {
  document.getElementById("t").value =
    n == "$1 / ថ្ងៃ" ? "សន្សំ $" + g : "សន្សំ $" + g;
  document.getElementById("g").value = g;
  document.getElementById("d").value = d;
  calc();
}
function calc() {
  var g = +document.getElementById("g").value,
    d = +document.getElementById("d").value;
  document.getElementById("dc").textContent =
    g > 0 && d > 0 ? Math.ceil(g / d) + " ថ្ងៃ" : "—";
}
function mv(n) {
  cm = new Date(cm.getFullYear(), cm.getMonth() + n, 1);
  render();
}
function pick(d) {
  sd = d;
  render();
}
var V = {
  home: function () {
    var st = streaks(),
      tx = allTx(),
      tod = tx
        .filter(function (t) {
          return t.d == T();
        })
        .reduce(function (s, t) {
          return s + t.a;
        }, 0),
      act = S.c.filter(function (c) {
        return c.status == "active";
      }),
      fin = S.c.filter(function (c) {
        return c.status == "done";
      }).length;
    var h =
      '<div class="quote">💬 ' +
      QS[new Date().getDate() % 4] +
      '</div><div class="grid">' +
      [
        [$(total()), "សន្សំសរុប"],
        [$(tod), "សន្សំថ្ងៃនេះ"],
        [act.length, "កំពុងដំណើរការ"],
        [fin, "បានបញ្ចប់"],
        ["🔥 " + st.cur, "ថ្ងៃជាប់គ្នា"],
        [st.best, "កំណត់ត្រាវែងបំផុត"],
      ]
        .map(function (x) {
          return (
            '<div class="card stat" style="margin:0"><b>' +
            x[0] +
            "</b><span>" +
            x[1] +
            "</span></div>"
          );
        })
        .join("") +
      "</div>";
    if (!S.c.length)
      return (
        h +
        '<div class="card" style="text-align:center"><div style="font-size:48px">🐷</div><h2>ចាប់ផ្តើមគោលដៅសន្សំដំបូងរបស់អ្នក</h2><p class="mut">ឧទាហរណ៍៖ សន្សំ $1 រាល់ថ្ងៃរហូតដល់ $50។</p><button class="btn p" onclick="go(\'goals\')">បង្កើតគោលដៅថ្មី</button></div>'
      );
    h += act
      .map(function (c) {
        return card(c);
      })
      .join("");
    h +=
      '<div class="row"><h2>សកម្មភាពថ្មីៗ</h2><button class="ghost" onclick="go(\'hist\')">មើលទាំងអស់</button></div>' +
      hist(tx.slice(0, 4));
    return h;
  },
  goals: function () {
    var h =
      '<h2>បង្កើតគោលដៅថ្មី</h2><div class="card"><div class="chips">' +
      TPL.map(function (t) {
        return (
          '<button class="btn" onclick="tpl(\'' +
          t[0] +
          "'," +
          t[1] +
          "," +
          t[2] +
          ')">' +
          t[0] +
          "</button>"
        );
      }).join("") +
      '</div><label>ឈ្មោះគោលដៅ</label><input id="t" placeholder="ឧ. ទិញទូរស័ព្ទថ្មី"><label>រូបតំណាង</label><select id="i">' +
      ICONS.map(function (i) {
        return "<option>" + i + "</option>";
      }).join("") +
      '</select><label>ទឹកប្រាក់គោលដៅ ($)</label><input id="g" type="number" min="1" oninput="calc()" value="50"><label>ចំនួនសន្សំប្រចាំថ្ងៃ ($)</label><input id="d" type="number" min="0.5" step="0.5" oninput="calc()" value="1"><p>ចំនួនថ្ងៃដែលត្រូវការ៖ <b id="dc">50 ថ្ងៃ</b></p><button class="big" onclick="create()">ចាប់ផ្តើមគោលដៅ</button></div><h2>គោលដៅរបស់ខ្ញុំ</h2>';
    return (
      h +
      (S.c.length
        ? S.c
            .map(function (c) {
              return card(c, 1);
            })
            .join("")
        : '<p class="mut">មិនទាន់មានគោលដៅទេ។</p>')
    );
  },
  cal: function () {
    var y = cm.getFullYear(),
      m = cm.getMonth(),
      D = dates(),
      first = new Date(y, m, 1).getDay(),
      n = new Date(y, m + 1, 0).getDate(),
      s = Object.keys(D).sort()[0] || T(),
      h =
        '<h2>ប្រតិទិនសន្សំ</h2><div class="card"><div class="row" style="margin-bottom:10px"><button class="btn" onclick="mv(-1)">‹</button><b>' +
        M[m] +
        " " +
        y +
        '</b><button class="btn" onclick="mv(1)">›</button></div><div class="cal">' +
        W.map(function (w) {
          return '<div class="h">' + w + "</div>";
        }).join("");
    for (var i = 0; i < first; i++) h += '<div class="e"></div>';
    for (var d = 1; d <= n; d++) {
      var k =
          y +
          "-" +
          String(m + 1).padStart(2, "0") +
          "-" +
          String(d).padStart(2, "0"),
        c = D[k] ? "ok" : k >= s && k < T() ? "miss" : "";
      h +=
        '<div class="' +
        c +
        (sd == k ? " sel" : "") +
        '" onclick="pick(\'' +
        k +
        "')\">" +
        d +
        (D[k] ? "<small>" + $(D[k]) + "</small>" : "") +
        "</div>";
    }
    h +=
      '</div><p class="mut">🟩 បានសន្សំ &nbsp; 🟧 ខកខាន &nbsp; ⬜ នឹងមកដល់</p></div>';
    if (sd) {
      var r = allTx().filter(function (t) {
        return t.d == sd;
      });
      h +=
        '<div class="card"><b>' +
        sd +
        "</b>" +
        (r.length
          ? hist(r)
          : '<p class="mut">មិនមានការសន្សំក្នុងថ្ងៃនេះ។ អ្នកអាចរំលងបាន ដោយមិនបាត់លុយដែលបានសន្សំ។</p>') +
        "</div>";
    }
    return h;
  },
  hist: function () {
    var q = window.q || "";
    return (
      '<h2>ប្រវត្តិសន្សំ</h2><input placeholder="ស្វែងរកតាមឈ្មោះគោលដៅ…" value="' +
      q +
      '" oninput="window.q=this.value;render(1)"><div class="card" style="margin-top:12px">' +
      hist(
        allTx().filter(function (t) {
          return t.t.indexOf(q) > -1;
        }),
      ) +
      "</div>"
    );
  },
  ach: function () {
    var st = streaks(),
      tt = total(),
      fin = S.c.some(function (c) {
        return c.status == "done";
      }),
      a = [
        ["🌱", "ការសន្សំដំបូង", allTx().length > 0],
        ["🔥", "ជាប់គ្នា ៣ ថ្ងៃ", st.best >= 3],
        ["🔥", "ជាប់គ្នា ៧ ថ្ងៃ", st.best >= 7],
        ["⚡", "ជាប់គ្នា ១៤ ថ្ងៃ", st.best >= 14],
        ["🌟", "ជាប់គ្នា ៣០ ថ្ងៃ", st.best >= 30],
        ["👑", "ជាប់គ្នា ៥០ ថ្ងៃ", st.best >= 50],
        ["🏅", "បានបញ្ចប់គោលដៅ", fin],
        ["🪙", "សន្សំបាន $10", tt >= 10],
        ["💵", "សន្សំបាន $25", tt >= 25],
        ["💰", "សន្សំបាន $50", tt >= 50],
        ["🏦", "សន្សំបាន $100", tt >= 100],
        ["💎", "សន្សំបាន $500", tt >= 500],
      ];
    var days = Object.keys(dates()).length,
      mo = Object.keys(dates()).filter(function (d) {
        return d.slice(0, 7) == T().slice(0, 7);
      }).length;
    return (
      '<h2>ស្ថិតិ</h2><div class="grid">' +
      [
        [days, "ថ្ងៃសន្សំសរុប"],
        [$(days ? tt / days : 0), "មធ្យមភាគក្នុងមួយថ្ងៃ"],
        [mo, "ថ្ងៃសន្សំខែនេះ"],
        [st.best, "ជាប់គ្នាវែងបំផុត"],
      ]
        .map(function (x) {
          return (
            '<div class="card stat" style="margin:0"><b>' +
            x[0] +
            "</b><span>" +
            x[1] +
            "</span></div>"
          );
        })
        .join("") +
      "</div><h2>ពានរង្វាន់</h2>" +
      a
        .map(function (x) {
          return (
            '<div class="card ach' +
            (x[2] ? " on" : "") +
            '"><span>' +
            x[0] +
            "</span><b>" +
            x[1] +
            "</b>" +
            (x[2] ? " ✓" : "") +
            "</div>"
          );
        })
        .join("")
    );
  },
};
function hist(r) {
  return r.length
    ? "<table><tr><th>កាលបរិច្ឆេទ</th><th>គោលដៅ</th><th>ថ្ងៃទី</th><th>ចំនួន</th></tr>" +
        r
          .map(function (t) {
            return (
              "<tr><td>" +
              t.d +
              "</td><td>" +
              t.i +
              " " +
              t.t +
              "</td><td>" +
              t.n +
              "</td><td>" +
              $(t.a) +
              "</td></tr>"
            );
          })
          .join("") +
        "</table>"
    : '<p class="mut">មិនទាន់មានប្រវត្តិ។</p>';
}
function render(keep) {
  setAv();
  var a = document.getElementById("app"),
    f =
      document.activeElement &&
      document.activeElement.tagName == "INPUT" &&
      keep;
  a.innerHTML = V[view]();
  var n = NAV.map(function (x) {
    return (
      '<button class="' +
      (view == x[0] ? "on" : "") +
      '" onclick="go(\'' +
      x[0] +
      "')\">" +
      x[2] +
      "</button>"
    );
  }).join("");
  document.getElementById("nav").innerHTML = n;
  document.getElementById("nav2").innerHTML = NAV.map(function (x) {
    return (
      '<button class="' +
      (view == x[0] ? "on" : "") +
      '" onclick="go(\'' +
      x[0] +
      "')\"><span>" +
      x[1] +
      "</span>" +
      x[2] +
      "</button>"
    );
  }).join("");
  if (f) {
    var i = a.querySelector("input");
    i.focus();
    i.setSelectionRange(i.value.length, i.value.length);
  }
}
render();
