function expandRange(r, p) {
    // margin
    const m = p * (r[1] - r[0])
    return [r[0] - m, r[1] + m]
}

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
        // mark point
        const points = d3.select('#graph-svg')
            .selectAll('circle.point')
            .data(this.ds, this.keyLambda)
        points.join('circle.point')
        .attr('fill', d => d.name == selected.name ?
            state.colours.selected : state.colours.neutral)
        this.showNames()

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

        // confidence intervals
        d3.select('#confint')
            .selectAll('.ci')
            .remove()

        const marked = d3.select('#confint')
            .selectAll('.ci')
            .data(this.ds.filter(d => d == this.selected), this.keyLambda)
            .enter()
            .append('g')
            .attr('class', 'ci')

        console.log('click')
        marked.append('circle')
            .attr('class', 'marked-point')
            .attr('cx', d => this.xScale(this.xTransform(d)))
            .attr('cy', d => this.yScale(this.yTransform(d)))
            .attr('r', 10)
            .attr('fill', d => this.colours.selected)
            .on('click', (e, d) => this.clickPoint(d))
            .on('mouseenter', (e, d) => this.hoverPoint(d))
            .on('mouseleave', () => {
                this.showNames({})
                this.hoverPoint({})
            })

         marked.append('line')
             .style("stroke", this.colours.selected)
             .style("stroke-width", 5)
             .attr('x1', d => this.xScale(d.low))
             .attr('x2', d => this.xScale(d.high))
             .attr('y1', d => this.yScale(this.yTransform(d)))
             .attr('y2', d => this.yScale(this.yTransform(d)))

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

    selectCocktail(e) {
        const query = document.querySelector('#searchbar').value
        if (this.loaded & e.key === "Enter") {
            const match = this.ds.filter(d => d.name == query)
            if (match) {
                console.log(match)
                this.clickPoint(match[0]) 
            }
        } else if (this.loaded) {
            //this.updateGraph(query.toLowerCase())
        }
    }
}

// search bar ---------------------


// script ------------------

const state = new State()

d3.select('#searchbar')
    .on('keyup', (e) => state.selectCocktail(e))

// load data from API ---------------------
const response = await fetch('api');
const ds = await response.json() 
state.initializeGraph(ds)
