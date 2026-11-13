// History Roots builder (ExtendScript, ES3).
// build-history-roots.mjs puts `var DATA = {...}` above this file. Run inside After Effects.
// Layout mirrors src/components/home/history-roots.tsx: scene units (600 x 2000) live under the
// "Camera" null, which scales them to 1080px tall and pans from the roots up to the branches.
// Note: in a shape layer the first group in the list is drawn on top, so groups are added top-first.

(function () {
  var D = DATA;
  var C = D.COLORS;
  var S = D.SCALE;
  var DUR = D.DURATION;
  var LOG = [];
  var MEDIUM = "GmarketSansMedium";
  var BOLD = "GmarketSansBold";

  function T(p) { return p * DUR; }

  var started = new Date().getTime();
  /** Writes progress with elapsed seconds, so a slow or failed build shows where it stopped. */
  function mark(label) {
    LOG.push(((new Date().getTime() - started) / 1000).toFixed(1) + "s " + label);
    writeLog();
  }

  function writeLog() {
    var f = new File(D.OUT_DIR + "/history-roots.log.txt");
    f.encoding = "UTF-8";
    f.lineFeed = "Unix";
    f.open("w");
    f.write(LOG.join("\n"));
    f.close();
  }

  /* ---------- keyframes ---------- */

  function mix(a, b, f) {
    if (a instanceof Array) {
      var r = [];
      for (var i = 0; i < a.length; i++) r.push(a[i] + (b[i] - a[i]) * f);
      return r;
    }
    return a + (b - a) * f;
  }
  function keys(prop, list, hold) {
    for (var k = 0; k < list.length; k++) prop.setValueAtTime(list[k][0], list[k][1]);
    var type = hold ? KeyframeInterpolationType.HOLD : KeyframeInterpolationType.LINEAR;
    for (var j = 1; j <= prop.numKeys; j++) prop.setInterpolationTypeAtKey(j, type, type);
  }
  /** useTransform(progress, [p0, p1], [v0, v1]) with clamping, in video time */
  function ramp(prop, p0, p1, v0, v1) {
    var t0 = T(p0);
    var t1 = T(p1);
    if (t0 < 0) { v0 = mix(v0, v1, -t0 / (t1 - t0)); t0 = 0; }
    if (t1 > DUR) { v1 = mix(v0, v1, (DUR - t0) / (t1 - t0)); t1 = DUR; }
    keys(prop, [[t0, v0], [t1, v1]]);
  }

  /* ---------- layers ---------- */

  function xf(layer) { return layer.property("ADBE Transform Group"); }
  function place(layer, name, parent, pos) {
    layer.name = name;
    if (parent) layer.parent = parent;
    xf(layer).property("ADBE Anchor Point").setValue([0, 0]);
    xf(layer).property("ADBE Scale").setValue([100, 100]);
    xf(layer).property("ADBE Position").setValue(pos || [0, 0]);
    return layer;
  }

  function contents(layer) { return layer.property("ADBE Root Vectors Group"); }
  function group(layer, name) { contents(layer).addProperty("ADBE Vector Group").name = name; }
  function G(layer, name) { return contents(layer).property(name); }
  function V(layer, name) { return G(layer, name).property("ADBE Vectors Group"); }
  function addPaths(layer, name, subs) {
    for (var k = 0; k < subs.length; k++) {
      var pp = V(layer, name).addProperty("ADBE Vector Shape - Group");
      var s = new Shape();
      s.vertices = subs[k].v;
      s.inTangents = subs[k].i;
      s.outTangents = subs[k].o;
      s.closed = subs[k].closed;
      pp.property("ADBE Vector Shape").setValue(s);
    }
  }
  function addEllipse(layer, name, x, y, r) {
    var e = V(layer, name).addProperty("ADBE Vector Shape - Ellipse");
    e.property("ADBE Vector Ellipse Size").setValue([r * 2, r * 2]);
    e.property("ADBE Vector Ellipse Position").setValue([x, y]);
  }
  function addRect(layer, name, w, h, radius) {
    var r = V(layer, name).addProperty("ADBE Vector Shape - Rect");
    r.property("ADBE Vector Rect Size").setValue([w, h]);
    r.property("ADBE Vector Rect Roundness").setValue(radius);
  }
  function addTrim(layer, name, p0, p1) {
    var t = V(layer, name).addProperty("ADBE Vector Filter - Trim");
    ramp(t.property("ADBE Vector Trim End"), p0, p1, 0, 100);
  }
  function addStroke(layer, name, color, width, opacity, round) {
    var s = V(layer, name).addProperty("ADBE Vector Graphic - Stroke");
    s.property("ADBE Vector Stroke Color").setValue(color);
    s.property("ADBE Vector Stroke Width").setValue(width);
    s.property("ADBE Vector Stroke Opacity").setValue(opacity * 100);
    if (round) s.property("ADBE Vector Stroke Line Cap").setValue(2);
  }
  function addFill(layer, name, color, opacity, evenOdd) {
    var f = V(layer, name).addProperty("ADBE Vector Graphic - Fill");
    f.property("ADBE Vector Fill Color").setValue(color);
    f.property("ADBE Vector Fill Opacity").setValue(opacity * 100);
    if (evenOdd) f.property("ADBE Vector Fill Rule").setValue(2);
  }
  function gxf(layer, name) { return G(layer, name).property("ADBE Vector Transform Group"); }

  /* ---------- text ---------- */

  function textLayer(str, font, size, color, opts) {
    opts = opts || {};
    var l = comp.layers.addText(str);
    var p = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = p.value;
    // Older AE versions lack these resets; the explicit values below still apply.
    try { td.resetCharStyle(); td.resetParagraphStyle(); } catch (e) { LOG.push("text reset skipped: " + e); }
    td.font = font;
    td.fontSize = size;
    td.applyFill = true;
    td.fillColor = color;
    td.applyStroke = false;
    td.tracking = opts.tracking || 0;
    if (opts.leading) { td.autoLeading = false; td.leading = opts.leading; }
    td.justification = opts.center ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY;
    p.setValue(td);
    return l;
  }
  function setText(l, str) {
    var p = l.property("ADBE Text Properties").property("ADBE Text Document");
    var td = p.value;
    td.text = str;
    p.setValue(td);
  }
  function textWidth(l) { return l.sourceRectAtTime(0, false).width; }
  /** Greedy word wrap on spaces, so "K-GANADA™" style words are never split. Returns line count. */
  function wrap(l, str, maxW) {
    var words = str.split(" ");
    var lines = [];
    var cur = "";
    for (var k = 0; k < words.length; k++) {
      var cand = cur ? cur + " " + words[k] : words[k];
      setText(l, cand);
      if (!cur || textWidth(l) <= maxW) cur = cand;
      else { lines.push(cur); cur = words[k]; }
    }
    lines.push(cur);
    setText(l, lines.join("\r"));
    return lines.length;
  }
  /** Baseline y for a CSS line box that starts at `top`. */
  function baseline(top, size, leading) { return top + (leading - size) / 2 + size * 0.8; }

  /* ---------- build ---------- */

  app.beginUndoGroup("Build History Roots");
  app.project.expressionEngine = "javascript-1.0";

  for (var n = app.project.numItems; n >= 1; n--) {
    var old = app.project.item(n);
    if (old instanceof CompItem && old.name === "History Roots") old.remove();
  }
  // Clears solids left by a previous build; a failure only leaves unused items behind.
  try { app.project.removeUnusedFootage(); } catch (e) { LOG.push("cleanup skipped: " + e); }

  var comp = app.project.items.addComp("History Roots", D.W, D.H, 1, DUR, D.FPS);
  comp.bgColor = C.night;

  // Camera: scene units -> pixels, pans from the bottom of the scene (roots) to the top (branches)
  var cam = comp.layers.addNull(DUR);
  cam.name = "Camera";
  xf(cam).property("ADBE Anchor Point").setValue([0, 0]);
  xf(cam).property("ADBE Scale").setValue([S * 100, S * 100]);
  var camX = D.W / 2 - (D.SCENE_W / 2) * S;
  keys(xf(cam).property("ADBE Position"), [[0, [camX, -(D.SCENE_H - D.VIEW_H) * S]], [DUR, [camX, 0]]]);

  function sceneShape(name) { return place(comp.layers.addShape(), name, cam); }
  function gradientSolid(name, x, y, w, h, c0, c1) {
    var l = place(comp.layers.addSolid(c0, name, w, h, 1), name, cam, [x, y]);
    var fx = l.property("ADBE Effect Parade").addProperty("ADBE Ramp");
    fx.property(1).setValue([w / 2, 0]);
    fx.property(2).setValue(c0);
    fx.property(3).setValue([w / 2, h]);
    fx.property(4).setValue(c1);
    return l;
  }

  // Sky and soil
  gradientSolid("Sky", -600, 0, 1800, D.GROUND_Y, C.night, C.horizon);
  gradientSolid("Soil", -600, D.GROUND_Y, 1800, D.SCENE_H - D.GROUND_Y, C.soil, C.soilDeep);

  mark("background");
  // Stars (twinkle: 3.2s alternate, 0.25 -> 1)
  var stars = sceneShape("Stars");
  for (var si = 0; si < D.STARS.length; si++) {
    var st = D.STARS[si];
    var sn = "Star " + (si + 1);
    group(stars, sn);
    addEllipse(stars, sn, st.x, st.y, st.r);
    addFill(stars, sn, C.nightForeground, 1);
    gxf(stars, sn).property("ADBE Vector Group Opacity").expression =
      "var d=" + st.delay.toFixed(3) + ";if(time<d){100}else{var c=(time-d)/3.2;var k=Math.floor(c);var f=c-k;" +
      "if(k%2==1){f=1-f;}var e=f<0.5?2*f*f:1-Math.pow(-2*f+2,2)/2;(0.25+0.75*e)*100}";
  }

  mark("stars");
  // Pebbles
  var pebbles = sceneShape("Pebbles");
  group(pebbles, "Pebbles");
  for (var pi = 0; pi < D.PEBBLES.length; pi++) addEllipse(pebbles, "Pebbles", D.PEBBLES[pi].x, D.PEBBLES[pi].y, D.PEBBLES[pi].r);
  addFill(pebbles, "Pebbles", C.mintLine, 0.06);

  // Ground line and fine roots
  var ground = sceneShape("Ground");
  group(ground, "Ground");
  addPaths(ground, "Ground", D.GROUND);
  addStroke(ground, "Ground", C.mintLine, 2, 0.3);

  var fine = sceneShape("Fine Roots");
  group(fine, "Fine Roots");
  addPaths(fine, "Fine Roots", D.FINE_ROOTS);
  addStroke(fine, "Fine Roots", C.mintLine, 2, 0.12);

  mark("ground and fine roots");
  // Root strands: assets gathered at each tip flow into the root center
  for (var ri = 0; ri < D.ROOT_TIPS.length; ri++) {
    var tip = D.ROOT_TIPS[ri];
    var rn = "Root " + tip.i;
    var rl = sceneShape(rn);
    group(rl, "Ring");
    addEllipse(rl, "Ring", tip.x, tip.y, 18);
    addStroke(rl, "Ring", C.glow, 1, 0.4);
    group(rl, "Node");
    addEllipse(rl, "Node", tip.x, tip.y, 9);
    addFill(rl, "Node", C.glow, 1);
    group(rl, "Core");
    addPaths(rl, "Core", tip.path);
    addTrim(rl, "Core", tip.start, tip.start + 0.07);
    addStroke(rl, "Core", C.glow, 3, 1, true);
    group(rl, "Halo");
    addPaths(rl, "Halo", tip.path);
    addTrim(rl, "Halo", tip.start, tip.start + 0.07);
    addStroke(rl, "Halo", C.glow, 12, 0.18, true);
    group(rl, "Base");
    addPaths(rl, "Base", tip.path);
    addStroke(rl, "Base", C.mintLine, 3, 0.22);
    ramp(gxf(rl, "Ring").property("ADBE Vector Group Opacity"), tip.start - 0.03, tip.start + 0.01, 20, 100);
    ramp(gxf(rl, "Node").property("ADBE Vector Group Opacity"), tip.start - 0.03, tip.start + 0.01, 20, 100);

    // Sap: three dots travelling along the root every 2.4s
    for (var b = 0; b < 3; b++) {
      var dl = sceneShape(rn + " Sap " + (b + 1));
      group(dl, "Dot");
      addEllipse(dl, "Dot", 0, 0, 3.5);
      addFill(dl, "Dot", C.glow, 1);
      xf(dl).property("ADBE Position").expression =
        'var p=thisComp.layer("' + rn + '").content("Base").content("Path 1").path;' +
        "var per=2.4;var t=((time-" + (b * 0.8).toFixed(1) + ")%per+per)%per/per;p.pointOnPath(t);";
      ramp(xf(dl).property("ADBE Opacity"), tip.start + 0.02, tip.start + 0.05, 0, 100);
    }
  }

  mark("root strands");
  // Joshua tree and its outline light
  var tree = sceneShape("Joshua Tree");
  group(tree, "Tree");
  addPaths(tree, "Tree", D.TREE);
  addStroke(tree, "Tree", C.mintLine, 1.5, 0.25);
  addFill(tree, "Tree", C.tree, 1, true);

  var treeGlow = sceneShape("Tree Light");
  group(treeGlow, "Outline");
  addPaths(treeGlow, "Outline", D.TREE);
  addTrim(treeGlow, "Outline", 0.84, 1);
  addStroke(treeGlow, "Outline", C.glow, 2, 1);
  ramp(xf(treeGlow).property("ADBE Opacity"), 0.84, 1, 0, 100);

  mark("tree");
  // Light climbing the trunk, then the branches
  function glowPath(name, subs, p0, p1, width) {
    var l = sceneShape(name);
    group(l, "Core");
    addPaths(l, "Core", subs);
    addTrim(l, "Core", p0, p1);
    addStroke(l, "Core", C.glow, width, 1, true);
    group(l, "Halo");
    addPaths(l, "Halo", subs);
    addTrim(l, "Halo", p0, p1);
    addStroke(l, "Halo", C.glow, width * 3.5, 0.2, true);
  }
  glowPath("Trunk Light", D.TRUNK, 0.5, 0.84, 5);
  for (var bi = 0; bi < D.BRANCHES.length; bi++) {
    glowPath("Branch Light " + (bi + 1), D.BRANCHES[bi], 0.84 + bi * 0.015, 0.94 + bi * 0.01, 3);
  }

  mark("trunk and branches");
  // Revenue starts at the root center (dot + pulsing ring)
  var rev = sceneShape("Revenue");
  group(rev, "Pulse");
  addEllipse(rev, "Pulse", 0, 0, 14);
  addStroke(rev, "Pulse", C.glow, 2, 1);
  gxf(rev, "Pulse").property("ADBE Vector Position").setValue([D.ROOT.x, D.ROOT.y]);
  gxf(rev, "Pulse").property("ADBE Vector Scale").expression =
    "var t=(time%2.4)/2.4;var e=1-Math.pow(1-t,3);var s=100*(1+2*e);[s,s]";
  gxf(rev, "Pulse").property("ADBE Vector Group Opacity").expression =
    "var t=(time%2.4)/2.4;var e=1-Math.pow(1-t,3);80*(1-e)";
  group(rev, "Dot");
  addEllipse(rev, "Dot", D.ROOT.x, D.ROOT.y, 14);
  addFill(rev, "Dot", C.glow, 1);
  ramp(xf(rev).property("ADBE Opacity"), 0.44, 0.48, 0, 100);

  mark("revenue");
  // Branch labels: follow the scene but keep their pixel size
  for (var li = 0; li < D.BRANCH_LABELS.length; li++) {
    var bl = D.BRANCH_LABELS[li];
    var anchor = comp.layers.addNull(DUR);
    place(anchor, "Label " + bl.label, cam, [bl.x, bl.y]);
    ramp(xf(anchor).property("ADBE Scale"), bl.start, bl.start + 0.04, [93 / S, 93 / S], [100 / S, 100 / S]);

    var pill = place(comp.layers.addShape(), "Label " + bl.label + " Pill", anchor);
    var lt = textLayer(bl.label, MEDIUM, 14, C.nightForeground, { center: true });
    var lw = textWidth(lt);
    place(lt, "Label " + bl.label + " Text", anchor, [0, 14 * 0.36]);
    xf(lt).property("ADBE Anchor Point").setValue([0, 0]);
    group(pill, "Pill");
    addRect(pill, "Pill", lw + 24, 32, 16);
    addStroke(pill, "Pill", C.glow, 1, 0.4);
    addFill(pill, "Pill", C.night, 0.8);
    ramp(xf(pill).property("ADBE Opacity"), bl.start, bl.start + 0.04, 0, 100);
    ramp(xf(lt).property("ADBE Opacity"), bl.start, bl.start + 0.04, 0, 100);
  }

  mark("branch labels");
  /* ---------- screen overlay: title and step panel ---------- */

  var LEFT = (D.W - 1200) / 2 + 40;
  var TOP = 48;
  var title = textLayer("History", BOLD, 24, C.nightForeground, { tracking: -25 });
  place(title, "Title History", null, [LEFT, baseline(TOP, 24, 32)]);
  var sub = textLayer("연혁", MEDIUM, 14, C.mintLine);
  place(sub, "Title 연혁", null, [LEFT, baseline(TOP + 32 + 4, 14, 20)]);

  var PW = 352;
  var PAD = 24;
  var INNER = PW - PAD * 2;
  var BOTTOM = D.H - 48 - 0.18 * D.H;

  var panel = place(comp.layers.addShape(), "Step Panel", null);
  group(panel, "Box");
  addRect(panel, "Box", PW, 100, 20);
  addStroke(panel, "Box", C.glow, 1, 0.2);
  addFill(panel, "Box", C.night, 0.75);
  var boxSize = G(panel, "Box").property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size");
  var sizeKeys = [];
  var posKeys = [];

  function badge(stepNull, label, x, top, bg, fg, border) {
    var t = textLayer(label, MEDIUM, 12, fg, { tracking: 25 });
    var w = textWidth(t) + 24 + 2;
    var p = place(comp.layers.addShape(), "Badge " + label, stepNull, [x + w / 2, top + 12]);
    group(p, "Badge");
    addRect(p, "Badge", w, 24, 12);
    addStroke(p, "Badge", border, 1, 1);
    if (bg) addFill(p, "Badge", bg, 1);
    t.moveBefore(p);
    place(t, "Badge " + label + " Text", stepNull, [x + 13, baseline(top, 12, 24)]);
    return { width: w, layers: [p, t] };
  }

  var N = D.STEPS.length;
  for (var i = 0; i < N; i++) {
    var step = D.STEPS[i];
    var stepNull = comp.layers.addNull(DUR);
    place(stepNull, "Step " + (i + 1), null, [0, 0]);
    var made = [];
    var h;

    if (step.kind === "vision") {
      var vt = textLayer("", MEDIUM, 28, C.nightForeground, { leading: 38.5 });
      var nt = wrap(vt, step.title, INNER);
      var vd = textLayer("", MEDIUM, 16, C.mintLine, { leading: 26 });
      var nd = wrap(vd, step.description, INNER);
      h = PAD + nt * 38.5 + 12 + nd * 26 + PAD;
      var vTop = BOTTOM - h + PAD;
      place(vt, "Vision Title", stepNull, [LEFT + PAD, baseline(vTop, 28, 38.5)]);
      place(vd, "Vision Text", stepNull, [LEFT + PAD, baseline(vTop + nt * 38.5 + 12, 16, 26)]);
      made = [vt, vd];
    } else {
      var dt = textLayer(step.date, BOLD, 36, C.nightForeground, { leading: 36 });
      var bt = textLayer("", MEDIUM, 18, C.nightForeground, { leading: 24.75 });
      var nb = wrap(bt, step.text, INNER);
      var hasBadges = step.stage === "revenue" || step.planned;
      h = PAD + 36 + 12 + nb * 24.75 + (hasBadges ? 12 + 24 : 0) + PAD;
      var sTop = BOTTOM - h + PAD;
      place(dt, "Step " + (i + 1) + " Date", stepNull, [LEFT + PAD, baseline(sTop, 36, 36)]);
      place(bt, "Step " + (i + 1) + " Text", stepNull, [LEFT + PAD, baseline(sTop + 36 + 12, 18, 24.75)]);
      made = [dt, bt];
      if (hasBadges) {
        var bx = LEFT + PAD;
        var bTop = sTop + 36 + 12 + nb * 24.75 + 12;
        if (step.stage === "revenue") {
          var b1 = badge(stepNull, "매출의 시작", bx, bTop, C.badgeBg, C.primary, C.border);
          made = made.concat(b1.layers);
          bx += b1.width + 8;
        }
        if (step.planned) {
          var b2 = badge(stepNull, "예정", bx, bTop, null, C.nightForeground, C.mintLine);
          made = made.concat(b2.layers);
        }
      }
    }

    // Content swap: old exits for 0.2s, then the new one enters for 0.2s (AnimatePresence mode="wait")
    var tIn = i === 0 ? 0 : T(D.STARTS[i]) + 0.2;
    var tOut = i < N - 1 ? T(D.STARTS[i + 1]) : -1;
    var op = [];
    var ys = [];
    if (i === 0) { op.push([0, 100]); ys.push([0, [0, 0]]); }
    else { op.push([tIn, 0], [tIn + 0.2, 100]); ys.push([tIn, [0, 8]], [tIn + 0.2, [0, 0]]); }
    if (tOut >= 0) { op.push([tOut, 100], [tOut + 0.2, 0]); ys.push([tOut, [0, 0]], [tOut + 0.2, [0, -8]]); }
    keys(xf(stepNull).property("ADBE Position"), ys);
    for (var m = 0; m < made.length; m++) keys(xf(made[m]).property("ADBE Opacity"), op);

    sizeKeys.push([tIn, [PW, h]]);
    posKeys.push([tIn, [LEFT + PW / 2, BOTTOM - h / 2]]);
    LOG.push("step " + (i + 1) + " in=" + tIn.toFixed(2) + "s h=" + h.toFixed(1));
  }
  keys(boxSize, sizeKeys, true);
  keys(xf(panel).property("ADBE Position"), posKeys, true);
  panel.moveAfter(comp.layer("Step 1"));

  mark("step panel");
  /* ---------- save and queue a render ---------- */

  var aep = new File(D.OUT_DIR + "/history-roots.aep");
  app.project.save(aep);

  var rq = app.project.renderQueue;
  for (var q = rq.numItems; q >= 1; q--) {
    // An item whose comp was deleted throws on .comp; log it and keep the rest of the queue.
    try { if (rq.item(q).comp.name === "History Roots") rq.item(q).remove(); } catch (e) { LOG.push("queue item " + q + " skipped: " + e); }
  }
  var item = rq.items.add(comp);
  var om = item.outputModule(1);
  var tpls = om.templates;
  LOG.push("output templates: " + tpls.join(" | "));
  // Template names follow the AE UI language ("H.264 - Match Render Settings - 40 Mbps",
  // "H.264 - 렌더링 일치 설정 - 40Mbps"), so match on the H.264 bitrate instead of the full name.
  var chosen = null;
  for (var ti = 0; ti < tpls.length; ti++) if (/H\.264/.test(tpls[ti]) && /40\s?Mbps/i.test(tpls[ti])) chosen = tpls[ti];
  if (chosen) om.applyTemplate(chosen);
  else LOG.push("40Mbps H.264 template not found, keeping the default output module");
  om.file = new File(D.OUT_DIR + "/history-roots-master.mp4");
  LOG.push("template: " + chosen + " -> " + om.file.fsName);
  app.project.save(aep);
  app.endUndoGroup();

  LOG.push("OK layers=" + comp.numLayers + " project=" + aep.fsName);
  writeLog();
})();
