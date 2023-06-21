
export class MarkPoint {
    click(state) {
        // mark point
        const points = d3.select('#graph-svg')
            .selectAll('circle.point')
            .data(state.ds, state.keyLambda)
        points.join('circle.point')
        .attr('fill', d => d.name == state.selected.name ?
            state.colours.selected : state.colours.neutral)
        state.showNames()
    }

    init(state) {
    }

    sub(d) {
        return true
    }
}

export class MarkPointCI {
    click(state) {

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

    init(state) {
    }

    sub(d) {
        return true
    }
}

export class VolcanoSidebar {
    click(state) {
        const sidebar = d3.select('#sidebar')
        sidebar.html("") // delete all

        sidebar.append('h2')
            .attr('class', 'text-center')
            .text(state.selected.name)

        sidebar.append('p')
            .html('<b>p-value</b>&nbsp;' + state.selected.pvalue)
        sidebar.append('p')
            .html('<b>effect size</b>&nbsp;' + state.selected.effect_size)
        sidebar.append('p')
            .html('<b>effect size</b>&nbsp;' + state.selected.study)
    }

    sub(d) {
        return true
    }

    init(state) {
    }
}

export class MultipleStudies {
    click(state) {
    }

    sub(d) {
        return d.study == this.current_study
    }

    update_study(d) {
        this.current_study = d
        this.update()
        this.state.updateGraph()
    }

    update() {
        d3.select('#controls')
            .selectAll('button.study')
            .data(this.studies, d => d)
            .join('button')
            .attr('class', d => {
               return d == this.current_study ? 'btn study mr-2 btn-secondary' :
                    'btn study mr-2 btn-primary'
            })
    }

    init(state) {
        const controls = d3.select('#controls')
        this.studies = [... new Set(state.ds.map(x => x['study']))]
        this.current_study = this.studies[0]
        this.state = state

        controls.selectAll('button.study')
            .data(this.studies, d => d)
            .enter()
            .append('button')
            .attr('type', 'button')
            .attr('class', d => {
               return d == this.current_study ? 'btn study mr-2 btn-secondary' :
                    'btn study mr-2 btn-primary'
            })
            .html(d => d)
            .on('click', (e, d) => this.update_study(d))

    }
}
