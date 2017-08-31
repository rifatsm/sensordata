import due_times from '../due_times';
import moment from 'moment';

(($, window, document) => {
  const margin = {top: 20, right: 160, bottom: 30, left: 50}; // leaving space for the legend
  const width = 960 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const tickFormat = d3.time.format('%b %d');
  const legendOffset = 300;

  const x = d3.time.scale()
      .range([0, width - 150]);

  const y = d3.scale.linear()
      .range([height, 0]);

  const xAxis = d3.svg.axis()
      .scale(x)
      .ticks(d3.time.day, 5)
      .tickFormat(tickFormat)
      .orient('bottom');

  const yAxis = d3.svg.axis()
      .scale(y)
      .ticks(6)
      .orient('left');

  const editsArea = d3.svg.area()
    .interpolate('step')
    .x0((d) => x(d.start_time))
    .x1((d) => x(d.end_time))
    .y0(height)
    .y1((d) => y(d.edits));

  const testEditsArea = d3.svg.area()
    .interpolate('step')
    .x0((d) => x(d.start_time))
    .x1((d) => x(d.end_time))
    .y0(height)
    .y1((d) => y(d.testEdits));

  // Line function for due date lines.
  const line = d3.svg.line()
      .x((d) => d.x)
      .y((d) => d.y);

  const svg = d3.select('div.chart-area').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const term = 'fall2016';
  const assignment = 'assignment4';

  const ms1 = moment(+due_times[term][assignment]['milestone1']);
  const ms2 = moment(+due_times[term][assignment]['milestone2']);
  const ms3 = moment(+due_times[term][assignment]['milestone3']);
  const earlyBonus = moment(+due_times[term][assignment]['earlyBonus']);
  const dueTime = moment(+due_times[term][assignment]['dueTime']);

  const dataFile = 'ws-14475-p4.csv'
  d3.csv(dataFile, (error, data) => {
    if (error) throw error;

    // Prepare the data for visualisations. Basically we're making them dates or numbers,
    // depending on how we want to use them.
    let stopAt = 0;
    data.forEach((d) => {
      d.start_time = moment(+d.start_time);
      d.end_time = moment(+d.end_time);
      let diff = dueTime.diff(d.start_time, 'd');
      if (diff > -4) {
        stopAt++;
      }
      d.edits = +d.editSizeStmts;
      d.testEdits = +d.testEditSizeStmts;
      d.launches = +d.testLaunches + +d.normalLaunches;
    });

    data.splice(stopAt); // don't draw work sessions more than 4 days after the deadline

    // Specify input domains for the scales.
    const start_min = d3.min(data, (d) => d.start_time);
    const end_max = d3.max(data, (d) => d.end_time);
    x.domain([start_min, end_max]);

    const editsMax = d3.max(data, (d) => d.edits);
    const testEditsMax = d3.max(data, (d) => d.testEdits);
    const launchMax = d3.max(data, (d) => d.launches);
    y.domain([0, Math.max(editsMax, testEditsMax, launchMax)]);

    // Draw areas for solution code, test code, and launches. Draw them in order
    // decreasing maximums, so the smallest area ends up in front, and visible.
    const solutionCode = {
      max: editsMax,
      render() {
        svg.append('path')
          .datum(data)
          .attr('data-legend', 'Solution Code')
          .attr('class', 'edits solution-code')
          .attr('d', editsArea);
        }
    };

    const testCode = {
      max: testEditsMax,
      render() {
        svg.append('path')
          .datum(data)
          .attr('data-legend', 'Test Code')
          .attr('class', 'edits test-code')
          .attr('d', testEditsArea);
        }
    };

    // const areas = [ solutionCode, testCode ].sort((a, b) => b.max - a.max);
    testCode.render()
    solutionCode.render()

    // for (let i = 0; i < areas.length; i++) {
    //   areas[i].render();
    // }

    // Draw axes.
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .attr('class', 'axis-text')
        .style('text-anchor', 'end')
        .text('Statements changed');

    // Draw legend
    svg.append('g')
      .attr('class', 'legend')
      .attr('transform','translate(' + (width - legendOffset) + ',' + height / 7 + ')')
      .style('font-size', '12px')
      .call(d3.legend);

    // Get x-positions scaled by the time scale.
    const dueX = x(dueTime);
    const ms1X = x(ms1);
    const ms2X = x(ms2);
    const ms3X = x(ms3);
    const earlyX = x(earlyBonus);

    // Define end-points for each line. Basically top to bottom
    // at the appropriate date on the x-axis.
    const ms1Line = [{ 'x': ms1X, 'y': height }, { 'x': ms1X, 'y': 0 }];
    const ms2Line = [{ 'x': ms2X, 'y': height }, { 'x': ms2X, 'y': 0 }];
    const ms3Line = [{ 'x': ms3X, 'y': height }, { 'x': ms3X, 'y': 0 }];
    const earlyLine = [{ 'x': earlyX, 'y': height }, { 'x': earlyX, 'y': 0 }];
    const dueTimeLine = [{ 'x': dueX, 'y': height }, { 'x': dueX, 'y': 0 }];

    // Draw due date lines.
    const ms1G = svg.append('g')
      .attr('id', 'group-ms-1');
    ms1G.append('path')
      .attr('class', 'date-line milestone')
      .attr('d', line(ms1Line))
      .attr('stroke-dasharray', '10,10');
    ms1G.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', ms1X + 6)
      .attr('dy', '.71em')
      .attr('class', 'axis-text')
      .style('text-anchor', 'end')
      .text('M1')
      .attr('fill', 'black');


    const ms2G = svg.append('g')
      .attr('id', 'group-ms-2');
    ms2G.append('path')
      .attr('class', 'date-line milestone')
      .attr('d', line(ms2Line))
      .attr('stroke-dasharray', '10,10');
    ms2G.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', ms2X + 6)
      .attr('dy', '.71em')
      .attr('class', 'axis-text')
      .style('text-anchor', 'end')
      .text('M2')
      .attr('fill', 'black');

    const ms3G = svg.append('g')
      .attr('id', 'group-ms-3');
    ms3G.append('path')
      .attr('class', 'date-line milestone')
      .attr('d', line(ms3Line))
      .attr('stroke-dasharray', '10,10');
    ms3G.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', ms3X + 6)
      .attr('dy', '.71em')
      .attr('class', 'axis-text')
      .style('text-anchor', 'end')
      .text('M3')
      .attr('fill', 'black');

    if (earlyBonus.isValid()) {
      const earlyG = svg.append('g')
        .attr('id', 'group-early')
      earlyG.append('path')
        .attr('class', 'date-line early')
        .attr('d', line(earlyLine))
        .attr('stroke-dasharray', '10,10');
      earlyG.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', earlyX + 6)
        .attr('dy', '.71em')
        .attr('class', 'axis-text')
        .style('text-anchor', 'end')
        .text('E')
        .attr('fill', 'black');
    }

    const dueG = svg.append('g')
      .attr('id', 'group-due');
    dueG.append('path')
      .attr('class', 'date-line due')
      .attr('d', line(dueTimeLine))
      .attr('stroke-dasharray', '10,10');
    dueG.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', dueX + 6)
      .attr('dy', '.71em')
      .attr('class', 'axis-text')
      .style('text-anchor', 'end')
      .text('F')
      .attr('fill', 'black');
  });

})(window.jQuery, window, document);
