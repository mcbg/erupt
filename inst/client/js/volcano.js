import * as lt from './listeners.js'

function expandRange(r, p) {
    // margin
    const m = p * (r[1] - r[0])
    return [r[0] - m, r[1] + m]
}

class GraphController {
    constructor(clickListeners) {
        this.clickListeners = clickListeners 
        this.yTransform = d => d.log_pvalue,
        this.xTransform = d => d.effect_size,
        this.keyLamda = d => d.name,
        this.colours = {
            neutral: "#9d9393",
            query: "#f6ac8f",
            hover: "#EEE",
            selected: "#d83015",
            loading: "#DDD"
        }
        this.selected = { name: '___TEMP___' }
    }


    hoverPoint(hover) {
        // mark point
        const points = d3.select('#graph-svg')
            .selectAll('circle.point')
            .data(this.ds, this.keyLambda)

        points.join('circle.point')
            .attr('fill', d => d.name == this.selected.name ? this.colours.selected : 
                (d == hover ? this.colours.hover: this.colours.neutral))

        this.showNames(hover)

    }

    showNames(hover) {
        // show name
        d3.select('#graph-labels')
            .selectAll('text.point-label')
            .data(this.ds, state.keyLambda)
            .join('text.point-label')
            .attr('x', d => this.xScale(this.xTransform(d)))
            .attr('y', d => this.yScale(this.yTransform(d)))
            .text(d => hover == d | d == this.selected ? d.name : '')

    }

    clickPoint(selected) {
        this.selected = selected 
        this.clickListeners.forEach(x => x.update(state))
    }

    initializeGraph(rows) {
        this.ds = rows

        // get limits
        const effect_size_range = expandRange(
            d3.extent(rows, this.xTransform),
            0.07
        )
        const pvalue_range = expandRange(
            d3.extent(rows, this.yTransform),
            0.07
        )

        // config
        const w = 650
        const h = 450
        const margin = {x: 25, y: 30}

        // make scales
        this.xScale = d3.scaleLinear()
        .domain(effect_size_range)
        .range([1.5 * margin.x, w - margin.x])

        this.yScale = d3.scaleLinear()
        .domain(pvalue_range)
        .range([margin.y, h - margin.y])

        // make axes
        const xAxis = d3.axisBottom(this.xScale)
            .tickSizeOuter(0)

        const yAxis = d3.axisLeft(this.yScale)
            .tickSizeOuter(0)

        const svg = d3.select('.graph')
            .append('svg')
            .attr('id', 'graph-svg')
            .attr('width', '100%')
            .attr('viewBox', "0 0 " + w + " " + h)

        // add groups
        svg.append('g').attr('id', 'graph-points')
        svg.append('g').attr('id', 'confint')
        svg.append('g').attr('id', 'graph-labels')

        // add axes
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h-margin.y) + ')')
            .call(xAxis)

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + 1.5 * margin.x + ',0)')
            .call(yAxis)

        this.loaded = true
        this.makeGraph()
    }

    makeGraph () {
        const sub = this.ds
        const svg = d3.select('#graph-svg')

        // add points
        d3.select('#graph-points')
            .selectAll('circle.point')
            .data(sub, this.keyLambda)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => this.xScale(this.xTransform(d)))
            .attr('cy', d => this.yScale(this.yTransform(d)))
            .attr('r', 8)
            .attr('fill', d => this.colours.neutral)
            .on('click', (e, d) => this.clickPoint(d))
            .on('mouseenter', (e, d) => this.hoverPoint(d))
            .on('mouseleave', () => {
                this.showNames({})
                this.hoverPoint({})
            })

        d3.select('#graph-labels')
            .selectAll('text.point-label')
            .data(sub, this.keyLambda)
            .enter()
            .append('text')
            .text('')
            .attr('class', 'point-label')
            .attr('x', d => this.xScale(this.xTransform(d)))
            .attr('y', d => this.yScale(this.yTransform(d)))
            .attr('text-anchor', 'middle')
            .on('click', (e, d) => this.clickPoint(d))
            .on('mouseenter', (e, d) => this.hoverPoint(d))
            .on('mouseleave', () => {
                this.showNames({})
                this.hoverPoint({})
            })

    }

    processQuery(e) {
        const query = document.querySelector('#searchbar').value
        if (this.loaded & e.key === "Enter") {
            const match = this.ds.filter(d => d.name == query)
            if (match) {
                this.clickPoint(match[0]) 
            }
        } else if (this.loaded & query.length >= 2) {
            const isMatch = d => d.name
                    .toString()
                    .toLowerCase()
                    .includes(query.toString())

            // mark points that match query
            d3.select('#graph-points')
                .selectAll('circle.point')
                .data(this.ds)
                .transition()
                .attr('fill', d => isMatch(d) ? this.colours.query : this.colours.neutral)

            // view labels that match query
            const labs = d3.select('#graph-labels')
                .selectAll('text.point-label')
                .data(this.ds, this.keyLambda)

            labs.transition()
                .text(d => isMatch(d) ? d.name : '')
        }
    }
}



// script ------------------
//
const click_listeners = [
    new lt.MarkPointCI(),
    new lt.MarkPoint(),
    new lt.VolcanoSidebar
]

const state = new GraphController(click_listeners)

// search bar ---------------------

d3.select('#searchbar')
    .on('keyup', (e) => state.processQuery(e))

// load data from API ---------------------

const response = await fetch('api');
const ds = await response.json() 
state.initializeGraph(ds)
