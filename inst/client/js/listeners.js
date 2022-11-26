
export class MarkPoint {
    update(state) {
        // mark point
        const points = d3.select('#graph-svg')
            .selectAll('circle.point')
            .data(state.ds, state.keyLambda)
        points.join('circle.point')
        .attr('fill', d => d.name == state.selected.name ?
            state.colours.selected : state.colours.neutral)
        state.showNames()
    }
}

export class MarkPointCI {
    update(state) {

        d3.select('#confint')
            .selectAll('.ci')
            .remove()

        const marked = d3.select('#confint')
            .selectAll('.ci')
            .data(state.ds.filter(d => d == state.selected), state.keyLambda)
            .enter()
            .append('g')
            .attr('class', 'ci')

        console.log('click')
        marked.append('circle')
            .attr('class', 'marked-point')
            .attr('cx', d => state.xScale(state.xTransform(d)))
            .attr('cy', d => state.yScale(state.yTransform(d)))
            .attr('r', 10)
            .attr('fill', d => state.colours.selected)
            .on('click', (e, d) => state.clickPoint(d))
            .on('mouseenter', (e, d) => state.hoverPoint(d))
            .on('mouseleave', () => {
                state.showNames({})
                state.hoverPoint({})
            })

         marked.append('line')
             .style("stroke", state.colours.selected)
             .style("stroke-width", 5)
             .attr('x1', d => state.xScale(d.low))
             .attr('x2', d => state.xScale(d.high))
             .attr('y1', d => state.yScale(state.yTransform(d)))
             .attr('y2', d => state.yScale(state.yTransform(d)))
    }
}

export class VolcanoSidebar {
    update (state) {
        const sidebar = d3.select('#sidebar')
        sidebar.html("") // delete all

        sidebar.append('h2')
            .attr('class', 'text-center')
            .text(state.selected.name)
        
        sidebar.append('p')
            .html('<b>p-value</b>&nbsp;' + state.selected.pvalue)
        sidebar.append('p')
            .html('<b>effect size</b>&nbsp;' + state.selected.effect_size)
    }
}
