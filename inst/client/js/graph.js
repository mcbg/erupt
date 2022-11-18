import {neighbours} from './neighbours.js'
import {mouseover} from './mouseover.js'

// -----------------------------
// global variables
// -----------------------------

class State {
    constructor() {
        this.loaded = false;
        this.keyLambda = d => d.name
        this.colours = {
            neutral: "#9d9393",
            neighbour: "#f6ac8f",
            selected: "#d83015",
            loading: "#DDD"
        }
    }

    setIngredientList(x) {
        this.ingredient_list = x
    }

    setSelected(o) {
        this.selected = o
    }

    setTimer() { // this is used to avoid bugs with mouseover

    }

    initializeGraph(rows) {
        this.pc = rows

        // get limits
        const pre_max = d3.max(rows, d => Math.max(d.pc1, d.pc2))
        const pre_min = d3.min(rows, d => Math.min(d.pc1, d.pc2))
        const m = (pre_max - pre_min) / 10
        const max = pre_max + m
        const min = pre_min - m

        const w = 650
        const h = 450
        const margin = {x: 25, y: 30}

        // make scales
        this.xScale = d3.scaleLinear()
        .domain([min, max])
        .range([1.5 * margin.x, w - margin.x])

        this.yScale = d3.scaleLinear()
        .domain([max, -max])
        .range([margin.y, h - margin.y])

        // make axes
        const xAxis = d3.axisBottom(this.xScale)
        .tickSizeOuter(0)
        const yAxis = d3.axisLeft(this.yScale)
            .tickSizeOuter(0)

        const svg = d3.select('.cocktail-graph')
            .append('svg')
            .attr('id', 'graph-svg')
            .attr('width', '100%')
            .attr('viewBox', "0 0 " + w + " " + h)

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h-margin.y) + ')')
            .call(xAxis)

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + 1.5 * margin.x + ',0)')
            .call(yAxis)

        svg.append('g')
            .attr('id', 'graph-loadings')

        svg.append('g')
            .attr('id', 'graph-points')

        //--------------------------------------------------
        // make loading vectors
        //--------------------------------------------------

        const origo = {x: this.xScale(0), y: this.yScale(0)}
        const state = this

        // define arrow heads
        d3.select('#graph-svg')
        .append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 7)
            .attr('markerHeight', 7)
            .attr('orient', 'auto')
            .attr('refY', 1.5)
            .attr('refX', 0.25)
            .attr('id', 'arrowhead')
            .html('<polygon points="0 0, 3 1.5, 0 3" fill="'+ state.colours.loading +'" stroke-width="0" />')

        d3.csv('loadings.csv', fmt_loadings)
            .then(function(loadings, errors) {
                // loading arrows
                d3.select('#graph-loadings')
                    .selectAll('line.loadings')
                    .data(loadings, d => d.variable)
                    .enter()
                    .append('line')
                    .attr('class', 'loadings')
                    .attr('x1', origo.x)
                    .attr('y1', origo.y)
                    .attr('x2', d => state.xScale(d.pc1 * 2))
                    .attr('y2', d => state.yScale(d.pc2 * 2))
                    .attr('stroke-width', 5)
                    .attr('stroke', state.colours.loading)
                    .attr('opacity', 1)
                    .attr('marker-end', 'url(#arrowhead)')

                // loading lables
                d3.select('#graph-loadings')
                    .selectAll('text.loadings-lab')
                    .data(loadings, d => d.variable)
                    .enter()
                    .append('text')
                    .attr('class', 'loadings-lab')
                    .text(d => d.variable.toUpperCase())
                    .attr('fill', state.colours.loading)
                    .attr('x', d => state.xScale(d.pc1 * 2.3))
                    .attr('y', d => state.yScale(d.pc2 * 2.3))
            })
        this.loaded = true
        this.makeGraph()
    }

    makeGraph () {
        const sub = this.pc
        const svg = d3.select('#graph-svg')
        const mouseover_f = mouseover(this)

        d3.select('#graph-points')
            .selectAll('circle.point')
            .data(sub, this.keyLambda)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => this.xScale(d.pc1))
            .attr('cy', d => this.yScale(d.pc2))
            .attr('r', 10)
            .attr('fill', d => this.colours.neutral)
            .on('click', (e, d) => neighbours(e, d, this))
            .on('mouseenter', mouseover_f)
            .on('mouseleave', () => {
                if (this.selected) {
                    neighbours({}, this.selected, this)
                } else {
                    this.makeGraph()
                    svg.selectAll('circle.point')
                        .data(this.pc)
                        .attr('opacity', 1)
                    d3.select('#graph-points')
                        .selectAll('text.cocktail-label')
                        .data(sub, this.keyLambda)
                        .text('')
                }
            })

        d3.select('#graph-points')
            .selectAll('text.cocktail-label')
            .data(sub, this.keyLambda)
            .enter()
            .append('text')
            .text('')
            .attr('class', 'cocktail-label')
            .attr('x', d => this.xScale(d.pc1))
            .attr('y', d => this.yScale(d.pc2) - 15)
            .attr('text-anchor', 'middle')
            .on('click', (e, d) => neighbours(e, d, this))
    }

    updateGraph (query) {
        const isQueried = d => d.name.toLowerCase().includes(query)
        const svg = d3.select('#graph-svg')

        svg.selectAll('circle.point')
            .data(this.pc)
            .transition()
            .attr('r', d => query !== '' && d.name.toLowerCase().includes(query) ? 10 : 10)
            .attr('fill', d => isQueried(d) ? this.colours.selected : this.colours.neutral)

        // update graph
        const labs = svg.selectAll('text.cocktail-label')
            .data(this.pc, this.keyLambda)

        labs.transition()
            .text(d => isQueried(d) ? d.name : '')
    }

    setNeighbours(o){
        this.nbrs = o
    }

    setCocktailStats(o) {
        this.cocktailStats = o
    }

    selectCocktail(e) {
        const query = document.querySelector('#cocktail-search').value
        if (this.loaded & e.key === "Enter") {
            const cocktail = this.pc.filter(d => d.name.includes(query))[0]
            if (cocktail) {
                neighbours({}, cocktail, state)
            }
        } else if (this.loaded) {
            this.updateGraph(query.toLowerCase())
        }
    }
}

const state = new State()

// -----------------------------
// search bar
// -----------------------------

d3.select('#cocktail-search')
    .on('keyup', (e) => state.selectCocktail(e))

// -----------------------------
// formats
// -----------------------------

function fmt_ingredients (d) {
    return {
        cocktail: d.cocktail,
        name: d.name,
        value: d.vol + " " + d.unit,
        vol: parseFloat(d.vol),
        abv: parseFloat(d.abv),
    };
}

function fmt_loadings (d) {
    return {
        variable: d.Variables,
        pc1: parseFloat(d.PC1),
        pc2: parseFloat(d.PC2)
    };
}

function fmt_stats (d) {
    return {
        name: d.cocktail,
        abv: parseFloat(d.diluted_abv),
        sugar: parseFloat(d.diluted_sugar),
        acid: parseFloat(d.diluted_acid)
    };
}


function fmt (d) {
    return {
        name: d.name,
        mediod: d.mediod,
        cluster: parseFloat(d.cluster),
        pc1: parseFloat(d.PC1),
        pc2: parseFloat(d.PC2),
        pc3: parseFloat(d.PC3)
    };
}

// -----------------------------
// read API
// -----------------------------

fetch('api').then(function(rows, errors) {
    if (errors) {
        console.log(errors)
    }
    state.setCocktailStats(rows)
})
