import { instance } from '@viz-js/viz';
import { mkdir, writeFile } from 'node:fs/promises';

// Source: the preserved FrontViewer useAlvaAR hook's camera-pose path.
// This is an integration diagram, not a reconstruction of SLAM internals.
// Graphviz generates all geometry; the browser needs no diagram runtime.
const stages = [
  ['01 / INPUT', 'Camera frame', 'Crop to viewport', 'ImageData'],
  ['02 / TRACKING', 'AlvaAR', 'Estimate camera pose', 'Pose matrix'],
  ['03 / CONVERSION', 'Pose conversion', 'Align coordinate axes', 'Quaternion + vector'],
  ['04 / OUTPUT', 'Three.js camera', 'Apply position + rotation', 'Camera transform'],
];
const viz = await instance();
await mkdir('public/images', { recursive: true });

for (const mobile of [false, true]) {
  const nodes = stages.map(([phase, title, detail, output], i) => {
    const accent = i === 0 || i === 2;
    const color = accent ? '#d9cfb5' : '#a6b2c3';
    const alignment = mobile ? 'CENTER' : 'LEFT';
    const width = mobile ? 294 : 180;
    const label = `<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0" WIDTH="${width}">
      <TR><TD ALIGN="${alignment}" WIDTH="${width}"><FONT COLOR="${color}" POINT-SIZE="10">${phase}</FONT></TD></TR>
      <TR><TD HEIGHT="16"></TD></TR>
      <TR><TD ALIGN="${alignment}"><FONT COLOR="#eceef2" POINT-SIZE="18">${title}</FONT></TD></TR>
      <TR><TD HEIGHT="9"></TD></TR>
      <TR><TD ALIGN="${alignment}"><FONT COLOR="#adb5c1" POINT-SIZE="12">${detail}</FONT></TD></TR>
      <TR><TD HEIGHT="17"></TD></TR>
      <HR/>
      <TR><TD HEIGHT="11"></TD></TR>
      <TR><TD ALIGN="${alignment}"><FONT COLOR="${color}" FACE="monospace" POINT-SIZE="11">${output}</FONT></TD></TR>
    </TABLE>`;
    return `n${i} [color="${color}",label=<${label}>];`;
  });
  const dot = `digraph Tracking {
    graph [rankdir=${mobile ? 'TB' : 'LR'}, bgcolor="transparent", pad="0.02", ranksep="${mobile ? 0.36 : 0.3}", nodesep="0.1"];
    node [shape=plain, fontname="Arial", fontcolor="#c8ced8"];
    edge [color="#667584", penwidth=1.2, arrowsize=0.55, arrowhead=vee];
    ${nodes.join('\n')}
    n0 -> n1 -> n2 -> n3;
  }`;
  const svg = viz.renderString(dot, { format: 'svg' });
  const name = `tracking-flow${mobile ? '-mobile' : ''}`;
  await writeFile(`public/images/${name}.svg`, svg);
  console.log(name, svg.match(/viewBox="([^"]+)"/)?.[1]);
}
