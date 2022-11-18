export const mouseover = (state) => {
    console.log('------------')
  console.log(state.ds.map(state.keyLambda))
  return (e, nb) => {
    if (state.selected && nb.name !== state.selected.name) {
      d3.select('#graph-svg')
        .selectAll('text.point-label')
        .data([nb], state.keyLambda)
        .transition()
        .text(d => d.name)

      d3.select(".neighbour-sidebar")
        .selectAll('div.neighbour')
        .style("background", d => d.name === nb.name ? "#ddd" : "#fff")

      d3.select('#graph-svg')
        .selectAll('circle.point')
        .data(state.ds, state.keyLambda)
        .attr('opacity', 1)
        .transition()
        .duration(100)
        .attr('opacity', d=> d.name === nb.name ? 0.5 : 1)

    } else if (!state.selected) {
      d3.select('#graph-svg')
        .selectAll('text.point-label')
        .data([nb], state.keyLambda)
        .transition()
        .text(d => d.name)

      d3.select('#graph-svg')
        .selectAll('circle.point')
        .data(state.ds, state.keyLambda)
        .attr('opacity', 1)
        .transition()
        .duration(100)
        .attr('opacity', d=> d.name === nb.name ? 0.5 : 1)
    }
  }

}
