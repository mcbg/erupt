import {neighbours} from './neighbours.js'
import {mouseover} from './mouseover.js'

class State {
    constructor() {
        this.yTransform = d => d.log_pvalue,
        this.xTransform = d => d.effect_size,
        this.keyLamda = d => d.name,
        this.colours = {
            neutral: "#9d9393",
            neighbour: "#f6ac8f",
            hover: "#EEE",
            selected: "#d83015",
            loading: "#DDD"
        }
    }

    // select highlighted analyte
    setSelected(o) {
      this.selected = o
    }

    hover_point(selected) {

        // mark point
        const points = d3.select('#graph-svg')
            .selectAll('circle.point')
            .data(state.ds, state.keyLambda)

        points.join('circle.point')
            .attr('fill', d => d.name == selected.name ?
            this.colours.hover : 
            (d == this.selected ? this.colours.selected :
               this.colours.neutral))

        // show name
        d3.select('#graph-svg')
            .selectAll('text.point-label')
            .data(this.ds, state.keyLambda)
            .join('text.point-label')
            .attr('x', d => this.xScale(this.xTransform(d)))
            .attr('y', d => this.yScale(this.yTransform(d)))
            .text(d => selected == d ? d.name : '')

    }

    click_point(selected) {

        this.selected = selected 
        // mark point
        const points = d3.select('#graph-svg')
            .selectAll('circle.point')
            .data(state.ds, state.keyLambda)
        points.transition('newColours')
        .attr('fill', d => d.name == selected.name ?
            state.colours.selected : state.colours.neutral)

        // update side bar
        const sidebar = d3.select('#sidebar')
        sidebar.html("") // delete all

        sidebar.append('h2')
            .attr('class', 'text-center')
            .text(selected.name)
        
        sidebar.append('p')
            .html('<b>p-value</b>&nbsp;' + selected.pvalue)
        sidebar.append('p')
            .html('<b>effect size</b>&nbsp;' + selected.effect_size)

    }

    initializeGraph(rows) {
        this.ds = rows

        // get limits
        const effect_size_range = d3.extent(rows, this.xTransform)
        const pvalue_range = d3.extent(rows, this.yTransform)

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

        // add group for points
        svg.append('g')
          .attr('id', 'graph-points')

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
        const mouseover_f = mouseover(this)

        // add points
        d3.select('#graph-points')
            .selectAll('circle.point')
            .data(sub, this.keyLambda)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => this.xScale(this.xTransform(d)))
            .attr('cy', d => this.yScale(this.yTransform(d)))
            .attr('r', 10)
            .attr('fill', d => this.colours.neutral)
            .on('click', (e, d) => this.click_point(d))
            .on('mouseover', (e, d) => this.hover_point(d))

        d3.select('#graph-points')
            .selectAll('text.point-label')
            .data(sub, this.keyLambda)
            .enter()
            .append('text')
            .text('')
            .attr('class', 'point-label')
            .attr('x', d => this.xScale(this.xTransform(d)))
            .attr('y', d => this.yScale(this.yTransform(d)))
            .attr('text-anchor', 'middle')
            .on('click', (e, d) => this.click_point(d))
    }

}

// script ------------------

const state = new State()
const response = await fetch('api');
const ds = await response.json() 
state.initializeGraph(ds)
